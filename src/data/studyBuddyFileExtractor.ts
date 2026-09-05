import * as pdfjsLib from "pdfjs-dist";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export interface ExtractedQuestionBlock {
  /** OCR text is a matching index. The original source crop is retained for source-faithful fallback/audit. */
  text: string;
  sourceImageDataUrl?: string;
  sourcePage?: number;
  confidence?: number;
  /** Layout lines retained for column-aware parsing (especially matching/table questions). */
  sourceLines?: Array<{ text: string; x0?: number; x1?: number; y0?: number; y1?: number }>;
  pageWidth?: number;
  pageHeight?: number;
  blockContext?: string;
  visualReference?: boolean;
  visualImageDataUrl?: string;
}

export interface ExtractedAttachmentText {
  fileName: string;
  mimeType: string;
  text: string;
  status: "extracted" | "empty" | "unsupported" | "failed";
  error?: string;
  questionBlocks?: ExtractedQuestionBlock[];
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const OCR_SCALE = 2;
const OCR_MAX_DIMENSION = 2600;
const SNAPSHOT_MAX_WIDTH = 1000;
const SNAPSHOT_QUALITY = 0.82;

function clean(value: unknown) {
  return String(value ?? "").replace(/[ \t]+/g, " ").trim();
}

function normalizeLine(value: unknown) {
  return clean(value).replace(/\s+([,.;:!?])/g, "$1");
}

function isQuestionStart(value: string) {
  const line = normalizeLine(value);
  // Numbered questions remain the primary structural boundary. OCR from PDFs and
  // camera photos commonly changes the punctuation, so accept the small family of
  // punctuation variants without changing the underlying question text.
  return /^(?:(?:q(?:uestion)?\s*)?\d{1,3}\s*[.)\-:;,]|\d{1,3}\s+)[ \t]*/i.test(line);
}

function optionCount(value: string) {
  return Array.from(String(value ?? '').matchAll(/(?:^|\s)(?:\(?)([A-D])(?:\)?)[.)\-:]\s+/gi)).length;
}

function isSectionOrNoise(value: string) {
  const line = normalizeLine(value);
  return /^(?:name|class|date|instruction|instructions|worksheet|noun worksheet|english grammar|grammar|for answer and help|answer(?:s)?|solution(?:s)?|answer key|solutions key|remember|types of nouns|extra types|column [ab])\b/i.test(line);
}

function isImplicitQuestionStart(value: string, next = '', nextTwo = '') {
  const line = normalizeLine(value);
  if (!line || isSectionOrNoise(line) || isAnswerBoundary(line)) return false;
  // An A/B/C/D option row belongs to the preceding stem; it is not a new question.
  if (/^\(?[A-D]\)?\s*[.)\-:]\s+/i.test(line) && optionCount(line) >= 1) return false;
  if (/^(?:[-•●▪◦]|[e¢©@])\s+/.test(line)) return true;
  if (/\b(?:state\s+true\s+or\s+false|true\s*\/\s*false|fill\s+in\s+the\s+blank|match\s+(?:the\s+)?following)\b/i.test(line)) return true;
  if (/_{2,}|\.{4,}/.test(line)) return true;
  if (optionCount(line) >= 2 || optionCount(next) >= 2 || optionCount(nextTwo) >= 2) return true;
  // Standalone question stems are common in short/long-answer worksheets.
  if (/[?]$/.test(line)) return true;
  if (/^(?:define|explain|describe|discuss|elaborate|write\s+(?:a|an|about|in)|give\s+(?:reasons?|an\s+explanation)|why\b|how\b|what\s+is\b|what\s+are\b|who\b|where\b|when\b|identify\b|find\b|state\b|name\b|list\b|write\b)/i.test(line) && line.length >= 12) return true;
  return false;
}

function isAnswerBoundary(value: string) {
  return /^(?:answer(?:s)?|solution(?:s)?|answer key|solutions key)\s*[:\-]?$/i.test(normalizeLine(value));
}

function canvasToDataUrl(canvas: HTMLCanvasElement) {
  const scale = Math.min(1, SNAPSHOT_MAX_WIDTH / Math.max(1, canvas.width));
  if (scale >= 1) return canvas.toDataURL("image/jpeg", SNAPSHOT_QUALITY);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(canvas.width * scale));
  out.height = Math.max(1, Math.round(canvas.height * scale));
  const ctx = out.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/jpeg", SNAPSHOT_QUALITY);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, 0, 0, out.width, out.height);
  return out.toDataURL("image/jpeg", SNAPSHOT_QUALITY);
}

async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  // Camera uploads are not always ordinary JPG/PNG files. iPhones may provide HEIC/HEIF,
  // and mobile browsers may expose EXIF rotation. Prefer createImageBitmap when available
  // because it can honor the source orientation and, on browsers with native support,
  // decode formats that HTMLImageElement cannot. Fall back to HTMLImageElement for broad
  // browser compatibility.
  const bitmapApi = (window as any).createImageBitmap as undefined | ((source: Blob, options?: any) => Promise<ImageBitmap>);
  if (bitmapApi) {
    try {
      const bitmap = await bitmapApi(file, { imageOrientation: "from-image", premultiplyAlpha: "default" });
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        bitmap.close?.();
        throw new Error("Unable to prepare the image for reading.");
      }
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close?.();
      return canvas;
    } catch {
      // Continue to the HTMLImageElement fallback below.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      URL.revokeObjectURL(url);
      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error("This image has no readable pixels."));
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return reject(new Error("Unable to prepare the image for reading."));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to decode this camera image in this browser. JPG, JPEG and PNG are universally supported; HEIC/HEIF works when the device/browser provides native decoding."));
    };
    image.src = url;
  });
}

function resizeForOcr(source: HTMLCanvasElement) {
  const longest = Math.max(source.width, source.height);
  const scale = Math.min(1, OCR_MAX_DIMENSION / Math.max(1, longest));
  if (scale >= 1) return source;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return source;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function preprocessForOcr(source: HTMLCanvasElement, mode: "contrast" | "threshold" = "contrast") {
  const resized = resizeForOcr(source);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, resized.width * OCR_SCALE);
  canvas.height = Math.max(1, resized.height * OCR_SCALE);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return resized;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(resized, 0, 0, canvas.width, canvas.height);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i];
    const g = image.data[i + 1];
    const b = image.data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (mode === "threshold") {
      // A clean black/white pass is particularly useful for photographed textbook pages.
      const value = luminance >= 166 ? 255 : 0;
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
    } else {
      const adjusted = Math.max(0, Math.min(255, (luminance - 128) * 1.55 + 128));
      image.data[i] = adjusted;
      image.data[i + 1] = adjusted;
      image.data[i + 2] = adjusted;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

type OcrWord = {
  text?: string;
  confidence?: number;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  block_num?: number;
  par_num?: number;
  line_num?: number;
  block?: number;
  paragraph?: number;
  line?: number;
};
type OcrLine = { text?: string; confidence?: number; bbox?: { x0: number; y0: number; x1: number; y1: number } };

function wordBox(word: OcrWord) {
  const b = word.bbox;
  if (b && Number.isFinite(b.x0) && Number.isFinite(b.y0) && Number.isFinite(b.x1) && Number.isFinite(b.y1)) return b;
  const left = Number(word.left ?? 0);
  const top = Number(word.top ?? 0);
  return { x0: left, y0: top, x1: left + Number(word.width ?? 0), y1: top + Number(word.height ?? 0) };
}

function getLinesFromTesseract(data: any): OcrLine[] {
  const native = Array.isArray(data?.lines) ? data.lines.filter((line: any) => clean(line?.text)) : [];
  if (native.length) {
    return native.map((line: any) => ({
      text: clean(line.text),
      confidence: Number(line.confidence ?? 0),
      bbox: line.bbox ? { x0: Number(line.bbox.x0), y0: Number(line.bbox.y0), x1: Number(line.bbox.x1), y1: Number(line.bbox.y1) } : undefined,
    }));
  }

  const words: OcrWord[] = Array.isArray(data?.words) ? data.words.filter((w: any) => clean(w?.text)) : [];
  const hasHierarchy = words.some(word => Number.isFinite(Number(word.line_num ?? word.line)) && Number.isFinite(Number(word.par_num ?? word.paragraph)) && Number.isFinite(Number(word.block_num ?? word.block)));
  if (!hasHierarchy) return [];

  const groups = new Map<string, OcrWord[]>();
  for (const word of words) {
    const key = `${Number(word.block_num ?? word.block ?? 0)}:${Number(word.par_num ?? word.paragraph ?? 0)}:${Number(word.line_num ?? word.line ?? 0)}`;
    const list = groups.get(key) ?? [];
    list.push(word);
    groups.set(key, list);
  }

  return Array.from(groups.values()).map(group => {
    const ordered = group.sort((a, b) => wordBox(a).x0 - wordBox(b).x0);
    return {
      text: ordered.map(w => clean(w.text)).join(" "),
      confidence: ordered.reduce((sum, w) => sum + Number(w.confidence ?? 0), 0) / Math.max(1, ordered.length),
      bbox: {
        x0: Math.min(...ordered.map(w => wordBox(w).x0)),
        y0: Math.min(...ordered.map(w => wordBox(w).y0)),
        x1: Math.max(...ordered.map(w => wordBox(w).x1)),
        y1: Math.max(...ordered.map(w => wordBox(w).y1)),
      },
    };
  }).sort((a, b) => (a.bbox?.y0 ?? 0) - (b.bbox?.y0 ?? 0));
}

function questionStartCount(lines: OcrLine[]) {
  return lines.filter(line => isQuestionStart(normalizeLine(line.text))).length;
}

function ocrQuality(lines: OcrLine[]) {
  if (!lines.length) return -1;
  const chars = lines.reduce((sum, line) => sum + normalizeLine(line.text).replace(/[^a-z0-9]/gi, "").length, 0);
  const confidence = lines.reduce((sum, line) => sum + Number(line.confidence ?? 0), 0) / lines.length;
  const starts = questionStartCount(lines);
  // Question starts are weighted heavily because the final matcher works on question blocks.
  return starts * 90 + Math.min(chars, 6000) / 20 + confidence;
}

function looksLikeDocumentNoise(text: string) {
  const line = normalizeLine(text);
  return /^(?:name|class|date|instruction|instructions|worksheet|noun worksheet|english grammar|grammar|for answer and help|remember|types of nouns|extra types|answer(?:s)?|solution(?:s)?|answer key|solutions key|page\s+\d+|\d+\s*\/\s*\d+)\b/i.test(line);
}


function hasBlankLike(value: string) {
  return /_{2,}|\.{4,}|_{1,}\s+(?:\(|$)/.test(value) || /\b(?:fill\s+in\s+the\s+blank|fill\s+in\s+the\s+blanks|complete\s+the\s+sentence)/i.test(value);
}

function explicitActivitySignature(lines: OcrLine[]) {
  const text = lines.map(line => normalizeLine(line.text)).filter(Boolean).join(" ");
  if (!text) return "";
  const questionStarts = lines.filter(line => isQuestionStart(normalizeLine(line.text || ""))).length;
  // These are typically single-activity worksheet pages. If a page contains numbered
  // questions, let the numbered-question segmentation win so one Match/Fill block cannot
  // swallow unrelated questions.
  if (questionStarts === 0) {
    if (/cut\s+and\s+paste|sort\s+the\s+words|classify\s+the\s+words|correct\s+box/i.test(text) && /\bverb\b[\s\S]*\bnoun\b/i.test(text)) return "WORD_SORTING";
    if (/match\s+(?:the\s+)?following|column\s+a\b[\s\S]*column\s+b\b|list\s+i\b[\s\S]*list\s+ii\b/i.test(text)) return "MATCH_COLUMNS";
    const blanks = lines.filter(line => hasBlankLike(line.text || "")).length;
    if (blanks >= 3) return "FILL_BLANK";
  }
  return "";
}

function cropQuestionBlock(sourceCanvas: HTMLCanvasElement, slice: OcrLine[], page: number, coordinateScale: number, blockContext = ""): ExtractedQuestionBlock | null {
  const text = slice.map(line => normalizeLine(line.text)).filter(Boolean).join(" ").trim();
  if (text.length < 5) return null;
  const boxes = slice.map(line => line.bbox).filter(Boolean) as NonNullable<OcrLine["bbox"]>[];
  let visualImageDataUrl: string | undefined;
  const confidence = Math.round((slice.reduce((sum, line) => sum + Number(line.confidence ?? 0), 0) / Math.max(1, slice.length)) * 10) / 10;
  const visualReference = /\b(?:image|picture|diagram|figure|illustration|photo)\b/i.test(text);
  const sourceLines = slice.map(line => ({
    text: normalizeLine(line.text),
    x0: line.bbox?.x0,
    x1: line.bbox?.x1,
    y0: line.bbox?.y0,
    y1: line.bbox?.y1,
  }));
  if (!boxes.length) return { text, sourcePage: page, confidence, sourceLines, blockContext, visualReference, visualImageDataUrl };

  const mapped = boxes.map(box => ({ x0: box.x0 / coordinateScale, y0: box.y0 / coordinateScale, x1: box.x1 / coordinateScale, y1: box.y1 / coordinateScale }));
  const lineHeight = Math.max(2, Math.max(...mapped.map(box => box.y1 - box.y0)));
  if (visualReference && mapped.length >= 2) {
    const ordered = [...mapped].sort((a, b) => a.y0 - b.y0);
    let bestGap = 0, bestTop = 0, bestBottom = 0;
    for (let i = 0; i < ordered.length - 1; i += 1) {
      const gap = ordered[i + 1].y0 - ordered[i].y1;
      if (gap > bestGap) { bestGap = gap; bestTop = ordered[i].y1; bestBottom = ordered[i + 1].y0; }
    }
    if (bestGap >= lineHeight * 2.2) {
      const gx0 = Math.max(0, Math.floor(Math.min(...mapped.map(box => box.x0))));
      const gx1 = Math.min(sourceCanvas.width, Math.ceil(Math.max(...mapped.map(box => box.x1))));
      const gy0 = Math.max(0, Math.floor(bestTop + lineHeight * 0.2));
      const gy1 = Math.min(sourceCanvas.height, Math.ceil(bestBottom - lineHeight * 0.2));
      if (gx1 > gx0 && gy1 > gy0) {
        const visualCrop = document.createElement("canvas");
        visualCrop.width = gx1 - gx0; visualCrop.height = gy1 - gy0;
        const visualCtx = visualCrop.getContext("2d");
        if (visualCtx) { visualCtx.fillStyle = "#fff"; visualCtx.fillRect(0, 0, visualCrop.width, visualCrop.height); visualCtx.drawImage(sourceCanvas, gx0, gy0, visualCrop.width, visualCrop.height, 0, 0, visualCrop.width, visualCrop.height); visualImageDataUrl = canvasToDataUrl(visualCrop); }
      }
    }
  }
  const padY = Math.max(10, Math.round(lineHeight * 1.7));
  const padX = Math.max(12, Math.round(lineHeight * 1.1));
  const x0 = Math.max(0, Math.floor(Math.min(...mapped.map(box => box.x0)) - padX));
  const y0 = Math.max(0, Math.floor(Math.min(...mapped.map(box => box.y0)) - padY));
  const x1 = Math.min(sourceCanvas.width, Math.ceil(Math.max(...mapped.map(box => box.x1)) + padX));
  const y1 = Math.min(sourceCanvas.height, Math.ceil(Math.max(...mapped.map(box => box.y1)) + padY));
  if (x1 <= x0 || y1 <= y0) return { text, sourcePage: page, confidence, sourceLines, blockContext, visualReference, visualImageDataUrl };

  const crop = document.createElement("canvas");
  crop.width = x1 - x0; crop.height = y1 - y0;
  const ctx = crop.getContext("2d");
  if (!ctx) return { text, sourcePage: page, confidence, sourceLines, blockContext, visualReference, visualImageDataUrl };
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, crop.width, crop.height);
  ctx.drawImage(sourceCanvas, x0, y0, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return { text, sourceImageDataUrl: canvasToDataUrl(crop), sourcePage: page, confidence, sourceLines, blockContext, visualReference, visualImageDataUrl };
}

function leadingNumber(text: string) {
  const match = normalizeLine(text).match(/^(?:(?:q(?:uestion)?\s*)?(\d{1,3}))\s*[.)\-:;,]/i);
  return match ? Number(match[1]) : null;
}

function makeQuestionBlocksFromLines(lines: OcrLine[], sourceCanvas: HTMLCanvasElement, page = 1, coordinateScale = 1): ExtractedQuestionBlock[] {
  const normalized = lines.map(line => ({ ...line, text: normalizeLine(line.text), bbox: line.bbox ? {
    x0: line.bbox.x0 / coordinateScale, y0: line.bbox.y0 / coordinateScale, x1: line.bbox.x1 / coordinateScale, y1: line.bbox.y1 / coordinateScale,
  } : undefined })).filter(line => line.text);

  let content = normalized.filter(line => !isAnswerBoundary(line.text || ""));
  if (!content.length) return [];

  // Remove only obvious page furniture at the beginning/end. We deliberately keep
  // instruction lines inside an activity because they define how the question must be answered.
  while (content.length && looksLikeDocumentNoise(content[0].text || "") && !/instruction/i.test(content[0].text || "")) content.shift();
  while (content.length && /^(?:for answer and help|https?:\/\/|www\.)/i.test(content[content.length - 1].text || "")) content.pop();
  if (!content.length) return [];

  const activity = explicitActivitySignature(content);
  if (activity === "WORD_SORTING" || activity === "FILL_BLANK" || activity === "MATCH_COLUMNS") {
    const block = cropQuestionBlock(sourceCanvas, content, page, 1, content.slice(0, 3).map(line => line.text).join(" "));
    return block ? [block] : [];
  }

  const starts: number[] = [];
  let lastTopLevelNumber: number | null = null;
  for (let i = 0; i < content.length; i += 1) {
    const text = content[i].text || "";
    if (isQuestionStart(text)) {
      const n = leadingNumber(text);
      const previousWindow = content.slice(Math.max(0, i - 8), i).map(line => line.text).join(" ");
      const nextWindow = content.slice(i + 1, Math.min(content.length, i + 9)).map(line => line.text).join(" ");
      const insideMatchColumns = /column\s+a\b/i.test(previousWindow) && /column\s+b\b/i.test(nextWindow);
      if (insideMatchColumns) continue;
      // Numbered sub-items inside Match/Fill/Case activities commonly restart at 1.
      // A non-increasing numeric label is therefore treated as part of the current
      // question rather than a new top-level question.
      if (n !== null && lastTopLevelNumber !== null && n <= lastTopLevelNumber) continue;
      starts.push(i);
      if (n !== null) lastTopLevelNumber = n;
      continue;
    }
    // A question number can be separated from its stem by a line break in PDFs.
    if (/^\d{1,3}\s*[.)\-:;,]?\s*$/.test(text) && content[i + 1]) {
      const n = leadingNumber(`${text}.`);
      if (n !== null && lastTopLevelNumber !== null && n <= lastTopLevelNumber) continue;
      starts.push(i);
      if (n !== null) lastTopLevelNumber = n;
    }
  }

  // Numbered questions are authoritative. This preserves 1..N order and keeps their options attached.
  if (starts.length) {
    const blocks: ExtractedQuestionBlock[] = [];
    const pagePreamble = content.slice(0, starts[0]).map(line => line.text).filter(text => /instruction|underline|choose|select|answer|read|match|fill|complete|identify|write|state/i.test(text)).join(" ");
    for (let s = 0; s < starts.length; s += 1) {
      const start = starts[s];
      const end = s + 1 < starts.length ? starts[s + 1] : content.length;
      const slice = content.slice(start, end);
      const localPreamble = content.slice(Math.max(0, start - 3), start).map(line => line.text).filter(text => /instruction|underline|choose|select|answer|read|match|fill|complete|identify|write|state/i.test(text)).join(" ");
      const context = [pagePreamble, localPreamble].filter(Boolean).join(" ");
      const block = cropQuestionBlock(sourceCanvas, slice, page, 1, context);
      if (block) blocks.push(block);
    }
    return blocks;
  }

  // Unnumbered MCQs / worksheet bullets: a new stem is recognized by its own question
  // signature, while A/B/C/D rows stay attached to the stem.
  const implicitStarts: number[] = [];
  for (let i = 0; i < content.length; i += 1) {
    const text = content[i].text || "";
    const next = content[i + 1]?.text || "";
    if (/^instruction\b/i.test(text)) continue;
    const next2 = content[i + 2]?.text || "";
    if (/^(?:[-•●▪◦])\s+/.test(text)) { implicitStarts.push(i); continue; }
    if (optionCount(text) >= 2) continue;
    if (optionCount(next) >= 2 || optionCount(next2) >= 2) { implicitStarts.push(i); continue; }
    if (/\?$/.test(text) && !optionCount(text)) { implicitStarts.push(i); continue; }
    if (/^(?:state|identify|find|choose|select|pick|what|who|where|when|why|how|write|name|define|explain|describe|discuss|give|differentiate|rearrange|correct|complete|look|observe)\b/i.test(text) && text.length >= 10) implicitStarts.push(i);
  }
  if (!implicitStarts.length) {
    const block = cropQuestionBlock(sourceCanvas, content, page, 1);
    return block ? [block] : [];
  }
  const blocks: ExtractedQuestionBlock[] = [];
  for (let s = 0; s < implicitStarts.length; s += 1) {
    const start = implicitStarts[s], end = s + 1 < implicitStarts.length ? implicitStarts[s + 1] : content.length;
    const preamble = content.slice(Math.max(0, start - 3), start).map(line => line.text).filter(text => /instruction|choose|select|answer|read|match|fill|complete|identify|write|underline|circle/i.test(text)).join(" ");
    const block = cropQuestionBlock(sourceCanvas, content.slice(start, end), page, 1, preamble);
    if (block) blocks.push(block);
  }
  return blocks;
}

async function recognizeCanvasWithWorker(worker: any, canvas: HTMLCanvasElement, psm: string) {
  await worker.setParameters({
    tessedit_pageseg_mode: psm as any,
    preserve_interword_spaces: "1" as any,
  });
  return worker.recognize(canvas);
}

async function extractImage(file: File, onProgress: (value: number) => void): Promise<{ text: string; questionBlocks: ExtractedQuestionBlock[] }> {
  const source = await imageFileToCanvas(file);
  const enhanced = preprocessForOcr(source, "contrast");
  const threshold = preprocessForOcr(source, "threshold");

  const worker = await createWorker("eng", 1, {
    logger: (message: any) => {
      if (message.status === "recognizing text") onProgress(Math.min(88, 5 + Math.round((message.progress ?? 0) * 55)));
    },
  });

  try {
    // Photographs need a few deterministic OCR layouts. We keep the best result rather
    // than trusting one pass, because phone-camera perspective/spacing varies substantially.
    const passes: Array<{ canvas: HTMLCanvasElement; psm: string; scale: number; label: string }> = [
      { canvas: enhanced, psm: "6", scale: OCR_SCALE, label: "enhanced block" },
      { canvas: enhanced, psm: "11", scale: OCR_SCALE, label: "enhanced sparse" },
      { canvas: threshold, psm: "6", scale: OCR_SCALE, label: "threshold block" },
      { canvas: threshold, psm: "11", scale: OCR_SCALE, label: "threshold sparse" },
    ];

    let bestLines: OcrLine[] = [];
    let bestQuality = -1;
    let bestLabel = "";

    for (let i = 0; i < passes.length; i += 1) {
      const pass = passes[i];
      const result: any = await recognizeCanvasWithWorker(worker, pass.canvas, pass.psm);
      const lines = getLinesFromTesseract(result?.data);
      const quality = ocrQuality(lines);
      if (quality > bestQuality) {
        bestQuality = quality;
        bestLines = lines;
        bestLabel = pass.label;
      }
      onProgress(8 + Math.round(((i + 1) / passes.length) * 78));

      // Strong numbered extraction means further passes are unnecessary. This keeps good
      // camera shots fast while still recovering difficult shots through later passes.
      if (questionStartCount(lines) >= 3 && lines.length >= 8 && (lines.reduce((sum, l) => sum + Number(l.confidence ?? 0), 0) / lines.length) >= 65) break;
    }

    const text = bestLines.map(line => normalizeLine(line.text)).filter(Boolean).join("\n").trim();
    const bestPass = passes.find(pass => pass.label === bestLabel) ?? passes[0];
    const bestCoordinateScale = bestPass.canvas.width / Math.max(1, source.width);
    let questionBlocks = makeQuestionBlocksFromLines(bestLines, source, 1, bestCoordinateScale);

    // If the best OCR layout produced too few question blocks, inspect all OCR passes and
    // merge only genuinely new question blocks. This is the image equivalent of the PDF
    // extractor's complete question inventory and prevents a single weak OCR layout from
    // silently dropping relevant questions.
    if (questionBlocks.length < 3) {
      const extraBlocks: ExtractedQuestionBlock[] = [];
      for (let i = 0; i < passes.length; i += 1) {
        const result: any = await recognizeCanvasWithWorker(worker, passes[i].canvas, passes[i].psm);
        const lines = getLinesFromTesseract(result?.data);
        const passScale = passes[i].canvas.width / Math.max(1, source.width);
        extraBlocks.push(...makeQuestionBlocksFromLines(lines, source, 1, passScale));
        onProgress(88 + Math.round(((i + 1) / passes.length) * 8));
      }
      const seen = new Set(questionBlocks.map(block => normalizeComparable(block.text)));
      for (const block of extraBlocks) {
        const key = normalizeComparable(block.text);
        if (key.length >= 8 && !seen.has(key)) {
          seen.add(key);
          questionBlocks.push(block);
        }
      }
    }

    // Final structural fallback: some phone-camera OCR layouts return usable text but omit
    // line metadata. Re-segment the plain OCR text itself so the matcher still receives
    // individual attachment questions instead of one unstructured blob.
    if (questionBlocks.length === 0 && text) {
      const fallbackLines = text.split(/\r?\n/).map(value => ({ text: normalizeLine(value) })).filter(line => line.text);
      const fallbackStarts = fallbackLines.map((line, index) => ({ line, index }))
        .filter(item => isQuestionStart(item.line.text || "") || /^(?:[-•●▪◦]\s+)/.test(item.line.text || ""));
      for (let i = 0; i < fallbackStarts.length; i += 1) {
        const start = fallbackStarts[i].index;
        const end = i + 1 < fallbackStarts.length ? fallbackStarts[i + 1].index : fallbackLines.length;
        const block = fallbackLines.slice(start, end).map(line => line.text).join(" ").trim();
        if (block.length >= 8) questionBlocks.push({ text: block, sourcePage: 1, confidence: 0, sourceFidelity: "text-extracted" } as ExtractedQuestionBlock);
      }
    }

    // De-duplicate near-identical blocks created by multiple layouts while preserving the
    // source crop belonging to the first/highest-quality occurrence.
    const unique: ExtractedQuestionBlock[] = [];
    const seen = new Set<string>();
    for (const block of questionBlocks) {
      const key = normalizeComparable(block.text);
      if (key.length < 8 || seen.has(key)) continue;
      seen.add(key);
      unique.push(block);
    }

    // Keep the best OCR text for matching, but never use it as a replacement for the source
    // pixels when the renderer decides OCR is unsafe.
    void bestLabel;
    onProgress(98);
    return { text, questionBlocks: unique };
  } finally {
    await worker.terminate();
  }
}

function normalizeComparable(value: string) {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

async function renderPdfPage(page: any, scale = 1.8) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Unable to render PDF page.");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

function pdfTextLines(items: any[]): OcrLine[] {
  const rows: Array<{ items: any[]; y: number }> = [];
  const usable = items.filter(item => clean(item?.str));
  for (const item of usable) {
    const y = Number(item?.transform?.[5] ?? 0);
    const target = rows.find(row => Math.abs(row.y - y) <= 2.5);
    if (target) target.items.push(item);
    else rows.push({ items: [item], y });
  }
  return rows.sort((a, b) => b.y - a.y).map(row => {
    const ordered = [...row.items].sort((a, b) => Number(a?.transform?.[4] ?? 0) - Number(b?.transform?.[4] ?? 0));
    const xs = ordered.map(item => Number(item?.transform?.[4] ?? 0));
    const ys = ordered.map(item => Number(item?.transform?.[5] ?? 0));
    const widths = ordered.map(item => Number(item?.width ?? 0));
    const heights = ordered.map(item => Number(item?.height ?? 0));
    const x0 = Math.min(...xs, 0);
    const x1 = Math.max(...ordered.map((item, i) => xs[i] + widths[i]), x0 + 1);
    const y0 = Math.min(...ys.map((y, i) => y - heights[i]), row.y);
    const y1 = Math.max(...ys, row.y + 1);
    return { text: ordered.map(item => clean(item.str)).join(" "), confidence: 100, bbox: { x0, y0, x1, y1 } };
  });
}

async function extractPdf(file: File, onProgress: (value: number) => void): Promise<{ text: string; questionBlocks: ExtractedQuestionBlock[] }> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const allText: string[] = [];
  const allBlocks: ExtractedQuestionBlock[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const lines = pdfTextLines(content.items as any[]);
    const pageText = lines.map(line => normalizeLine(line.text)).filter(Boolean).join("\n");
    if (pageText) {
      allText.push(pageText);
      const source = await renderPdfPage(page, 1.8);
      const scale = source.width / Math.max(1, Number(page.view?.[2] ?? source.width / 1.8));
      const scaledLines = lines.map(line => ({ ...line, bbox: line.bbox ? { x0: line.bbox.x0 * scale, y0: source.height - line.bbox.y1 * scale, x1: line.bbox.x1 * scale, y1: source.height - line.bbox.y0 * scale } : undefined }));
      allBlocks.push(...makeQuestionBlocksFromLines(scaledLines, source, pageNumber));
    } else {
      const source = await renderPdfPage(page, 1.8);
      const prepared = preprocessForOcr(source, "contrast");
      const worker = await createWorker("eng", 1);
      try {
        const result: any = await recognizeCanvasWithWorker(worker, prepared, "6");
        const linesFromOcr = getLinesFromTesseract(result?.data);
        allText.push(linesFromOcr.map(line => normalizeLine(line.text)).filter(Boolean).join("\n"));
        allBlocks.push(...makeQuestionBlocksFromLines(linesFromOcr, source, pageNumber, OCR_SCALE));
      } finally {
        await worker.terminate();
      }
    }
    onProgress(10 + Math.round((pageNumber / Math.max(1, pdf.numPages)) * 78));
  }
  return { text: allText.filter(Boolean).join("\n").trim(), questionBlocks: allBlocks };
}

export async function extractStudyBuddyFileText(file: File, onProgress: (value: number) => void = () => undefined): Promise<ExtractedAttachmentText> {
  if (file.size > MAX_FILE_BYTES) return { fileName: file.name, mimeType: file.type, text: "", status: "failed", error: "Each file must be 10 MB or smaller." };
  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const extracted = await extractPdf(file, onProgress);
      return { fileName: file.name, mimeType: file.type, text: extracted.text, status: extracted.text ? "extracted" : "empty", questionBlocks: extracted.questionBlocks };
    }
    if (file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      const extracted = await extractImage(file, onProgress);
      return { fileName: file.name, mimeType: file.type, text: extracted.text, status: extracted.text ? "extracted" : "empty", questionBlocks: extracted.questionBlocks };
    }
    if (file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name)) {
      const text = clean(await file.text());
      onProgress(90);
      return { fileName: file.name, mimeType: file.type, text, status: text ? "extracted" : "empty" };
    }
    return { fileName: file.name, mimeType: file.type, text: "", status: "unsupported", error: "Supported attachments are PDF, JPG, JPEG, PNG, WEBP and text files." };
  } catch (error: any) {
    return { fileName: file.name, mimeType: file.type, text: "", status: "failed", error: error?.message ?? "Unable to read this file." };
  }
}

export async function extractStudyBuddyFiles(files: File[], onProgress: (completed: number, total: number, fileProgress: number) => void = () => undefined) {
  const results: ExtractedAttachmentText[] = [];
  for (let index = 0; index < files.length; index += 1) {
    const result = await extractStudyBuddyFileText(files[index], progress => onProgress(index, files.length, progress));
    results.push(result);
    onProgress(index + 1, files.length, 100);
  }
  return results;
}
