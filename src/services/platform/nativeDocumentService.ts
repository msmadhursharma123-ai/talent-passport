import { Capacitor } from "@capacitor/core";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read generated file."));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
}

function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function safeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, "-").trim();
  return cleaned || "talent-passport-file";
}

async function saveAndShareNativeBlob(
  blob: Blob,
  fileName: string,
  title: string,
): Promise<void> {
  const [{ Directory, Filesystem }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);

  const base64 = await blobToBase64(blob);
  // Keep a user-accessible copy in Documents. This makes a native PDF action
  // behave like a download even if the OS share sheet is dismissed or has no
  // target. iOS exposes this folder through the Files app via the native plist
  // patch, while Web/PWA never reaches this branch.
  const documentPath = `Talent Passport/${safeFileName(fileName)}`;
  const written = await Filesystem.writeFile({
    path: documentPath,
    data: base64,
    directory: Directory.Documents,
    recursive: true,
  });

  try {
    await Share.share({
      title,
      files: [written.uri],
      dialogTitle: title,
    });
  } catch (shareError) {
    // A cancelled/no-target share sheet must not remove the downloaded file.
    console.warn("Native file share was not completed; PDF remains saved.", shareError);
  }
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
  if (!images.length) return;

  await Promise.all(
    images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve) => {
          const finish = () => resolve();
          image.addEventListener("load", finish, { once: true });
          image.addEventListener("error", finish, { once: true });
        });
      }
      try {
        await image.decode();
      } catch {
        // A failed decode should not block the rest of the document.
      }
    }),
  );
}

async function renderHtmlDocumentToPdfBlob(
  bodyHtml: string,
  css: string,
  selector?: string,
): Promise<Blob> {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = "210mm";
  host.style.background = "#FFFFFF";
  host.style.color = "#111827";
  host.style.pointerEvents = "none";
  host.style.zIndex = "-1";
  host.innerHTML = `<style>${css}</style><div class="tp-native-print-root">${bodyHtml}</div>`;
  document.body.appendChild(host);

  try {
    if (document.fonts?.ready) await document.fonts.ready;
    await waitForImages(host);

    const target =
      (selector ? host.querySelector<HTMLElement>(selector) : null) ??
      host.querySelector<HTMLElement>(".tp-native-print-root");

    if (!target) throw new Error("Native PDF print target was not created.");

    const targetRect = target.getBoundingClientRect();
    const baseWidth = Math.max(1, Math.ceil(targetRect.width));
    const baseHeight = Math.max(1, Math.ceil(targetRect.height));
    const preferredScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    // Long teacher planners/doubt reports can be much taller than student
    // worksheets. Cap the rasterized pixel area to avoid WKWebView memory
    // pressure while retaining the existing high-resolution behaviour for
    // smaller documents.
    const maxPixels = 12000000;
    const areaLimitedScale = Math.sqrt(maxPixels / Math.max(1, baseWidth * baseHeight));
    const renderScale = Math.max(1, Math.min(preferredScale, areaLimitedScale));

    const canvas = await html2canvas(target, {
      backgroundColor: "#FFFFFF",
      scale: renderScale,
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
      windowWidth: baseWidth,
      windowHeight: baseHeight,
      scrollX: 0,
      scrollY: 0,
    });

    if (!canvas.width || !canvas.height) {
      throw new Error("Native PDF canvas was empty.");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const sourcePageHeight = Math.max(
      1,
      Math.floor((canvas.width * pageHeight) / pageWidth),
    );

    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      if (pageIndex > 0) pdf.addPage();

      const sliceHeight = Math.min(
        sourcePageHeight,
        canvas.height - sourceY,
      );
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const context = pageCanvas.getContext("2d");
      if (!context) throw new Error("Unable to prepare native PDF page.");

      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      const image = pageCanvas.toDataURL("image/png", 1);
      const heightMm = (sliceHeight * pageWidth) / canvas.width;
      pdf.addImage(image, "PNG", 0, 0, pageWidth, heightMm, undefined, "FAST");

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    return pdf.output("blob");
  } finally {
    host.remove();
  }
}

/**
 * Existing browser print/download path, plus a native Capacitor path for
 * HTML-generated documents that previously depended on window.open()/print.
 * Web/PWA keeps the original popup/print behaviour; native builds render the
 * same HTML into a PDF blob and use the existing Filesystem + Share adapter.
 */
export async function printHtmlAsPdf({
  bodyHtml,
  css,
  fileName,
  title,
  selector,
  popupBlockedMessage = "Please allow pop-ups for Talent Passport to print or save this PDF.",
}: {
  bodyHtml: string;
  css: string;
  fileName: string;
  title: string;
  selector?: string;
  popupBlockedMessage?: string;
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    const popup = window.open("", "_blank", "width=1100,height=900");
    if (!popup) {
      window.alert(popupBlockedMessage);
      return;
    }

    popup.document.open();
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtmlAttribute(title)}</title><style>${css}</style></head><body>${bodyHtml}<script>(function(){function ready(){var imgs=[].slice.call(document.images);if(!imgs.length){setTimeout(function(){window.focus();window.print()},180);return;}var left=imgs.length;function done(){left-=1;if(left<=0)setTimeout(function(){window.focus();window.print()},180)}imgs.forEach(function(img){if(img.complete)done();else{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}});setTimeout(function(){window.focus();window.print()},2500)}if(document.readyState==='complete')ready();else window.addEventListener('load',ready);window.onafterprint=function(){setTimeout(function(){window.close()},150)};})();<\/script></body></html>`);
    popup.document.close();
    return;
  }

  const blob = await renderHtmlDocumentToPdfBlob(bodyHtml, css, selector);
  await saveAndShareNativeBlob(blob, fileName, title);
}

/**
 * Keeps the existing browser download behaviour intact on Web/PWA.
 * On native Capacitor builds, writes the generated file to the app cache and
 * opens the OS share sheet so iOS/Android can save, send, print, or open it.
 */
export async function downloadOrShareBlob(
  blob: Blob,
  fileName: string,
  title = "Talent Passport"
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }

  await saveAndShareNativeBlob(blob, fileName, title);
}

export async function downloadOrSharePdfBlob(
  blob: Blob,
  fileName: string,
  title = "Talent Passport PDF"
): Promise<void> {
  await downloadOrShareBlob(blob, fileName, title);
}
