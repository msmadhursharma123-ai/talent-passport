export interface StudyBuddyDoubtSignal {
  topic: string;
  concept?: string;
  signals?: number;
}

export type StudyBuddyQuestionType =
  | "MCQ"
  | "FILL_BLANK"
  | "TRUE_FALSE"
  | "MATCH_COLUMNS"
  | "ASSERTION_REASON"
  | "VERY_SHORT_ANSWER"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "CASE_BASED"
  | "SOURCE_BASED"
  | "DATA_INTERPRETATION"
  | "READING_COMPREHENSION"
  | "IMAGE_BASED"
  | "DIAGRAM_LABEL"
  | "WORD_SORTING"
  | "IDENTIFY_UNDERLINE"
  | "ODD_ONE_OUT"
  | "REARRANGE"
  | "CORRECT_THE_SENTENCE"
  | "COMPLETE_TABLE"
  | "SEQUENCE_ORDER"
  | "ONE_WORD"
  | "GIVE_REASON"
  | "DIFFERENTIATE_COMPARE"
  | "GRAMMAR_TRANSFORMATION"
  | "OTHER";

export interface StudyBuddyQuestion {
  id: string;
  type: string;
  question: string;
  marks?: number;
  options?: string[];
  optionLabels?: string[];
  fillSentence?: string;
  blanks?: string[];
  fillItems?: Array<{ sentence: string; blank?: string; id?: string }>;
  statements?: string[];
  columnA?: Array<{ id?: string; text?: string }>; 
  columnB?: Array<{ id?: string; text?: string }>;
  imageDataUrl?: string;
  imageName?: string;
  imageInstruction?: string;
  passage?: string;
  passageQuestions?: Array<{ id?: string; question?: string; marks?: number; type?: string; options?: string[] }>;
  assertion?: string;
  reason?: string;
  assertionOptions?: string[];
  items?: string[];
  categories?: string[];
  wordBank?: string[];
  tableRows?: string[][];
  sourceOriginalText?: string;
  instruction?: string;
  sourceQuestionNumber?: string;
  visualReference?: boolean;
  sourceLines?: Array<{ text: string; x0?: number; x1?: number; y0?: number; y1?: number }>;
  /** When present, this is the original visual crop from the uploaded source. */
  sourceImageDataUrl?: string;
  sourcePage?: number;
  sourceConfidence?: number;
  sourceFidelity?: "original-snapshot" | "text-extracted";
  sourceFileName?: string;
  sourceContext?: string;
  [key: string]: unknown;
}

export interface StudyBuddyWorksheet {
  id: string;
  teacherUuid: string;
  teacherName: string;
  subjectName: string;
  chapterName: string;
  publishedAt: string;
  title: string;
  payload: { questions?: StudyBuddyQuestion[]; chapter?: string; schoolName?: string; [key: string]: unknown };
}

export interface MatchedStudyBuddyQuestion extends StudyBuddyQuestion {
  studyBuddySource: {
    sourceKind: "worksheet" | "attachment";
    sourceId: string;
    worksheetId?: string;
    attachmentId?: string;
    worksheetTitle: string;
    teacherName: string;
    chapterName: string;
    publishedAt: string;
    matchedDoubts: string[];
    score: number;
  };
}

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","by","can","for","from","how","in","into","is","it","of","on","or","that","the","their","this","to","was","were","what","when","where","which","who","why","with","your","you","i","my","me","do","does","did","not","than","then","there","these","those","very","about","under","over","using","used","use","explain","find","write","answer","question","choose","correct","following","given","below"
]);

function clean(value: unknown): string { return String(value ?? "").trim(); }

export function normalizeStudyBuddyText(value: unknown): string {
  return clean(value).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function tokenSet(value: unknown): Set<string> {
  return new Set(normalizeStudyBuddyText(value).split(" ").filter(Boolean).filter(token => token.length >= 2 && !STOP_WORDS.has(token)));
}

function questionSearchText(question: StudyBuddyQuestion): string {
  const parts: unknown[] = [
    question.question, question.fillSentence, ...(question.blanks ?? []), ...(question.fillItems ?? []).map(x => x.sentence), ...(question.options ?? []),
    ...(question.statements ?? []), ...(question.columnA ?? []).map(x => x.text), ...(question.columnB ?? []).map(x => x.text), question.imageInstruction,
    question.imageName, question.passage, ...(question.passageQuestions ?? []).map(x => x.question), question.assertion, question.reason,
    ...(question.items ?? []), ...(question.categories ?? []), ...(question.wordBank ?? []), ...(question.tableRows ?? []).flat(), clean(question.chapter), clean(question.topic), clean(question.subtopic),
    clean(question.sourceFileName), clean(question.sourceContext), clean(question.sourceOriginalText),
  ];
  return parts.map(clean).filter(Boolean).join(" ");
}

function questionCoreText(question: StudyBuddyQuestion): string {
  const parts: unknown[] = [
    question.question, question.fillSentence, ...(question.blanks ?? []), ...(question.fillItems ?? []).map(x => x.sentence),
    ...(question.statements ?? []), question.imageInstruction, question.passage, ...(question.passageQuestions ?? []).map(x => x.question),
    question.assertion, question.reason, ...(question.items ?? []), ...(question.categories ?? []), ...(question.wordBank ?? []),
    ...(question.tableRows ?? []).flat(), clean(question.chapter), clean(question.topic), clean(question.subtopic),
  ];
  return parts.map(clean).filter(Boolean).join(" ");
}

function directCorePhraseScore(question: StudyBuddyQuestion, label: string): number {
  const core = normalizeStudyBuddyText(questionCoreText(question));
  const wanted = normalizeStudyBuddyText(label);
  if (!core || !wanted || wanted.length < 4) return 0;
  const hasPhrase = core === wanted || core.startsWith(`${wanted} `) || core.endsWith(` ${wanted}`) || core.includes(` ${wanted} `);
  return hasPhrase ? (wanted.length >= 7 ? 10 : 8) : 0;
}

function phraseBonus(questionText: string, doubtText: string): number {
  const q = normalizeStudyBuddyText(questionText), d = normalizeStudyBuddyText(doubtText);
  // Very short concepts such as noun/verb can legitimately appear as an option in
  // an unrelated question. Only award the strong phrase signal to sufficiently
  // specific concepts; short labels rely on token/structure matching instead.
  const hasPhrase = q === d || q.startsWith(`${d} `) || q.endsWith(` ${d}`) || q.includes(` ${d} `);
  return q && d && d.length >= 6 && hasPhrase ? 70 : 0;
}

const TOPIC_ALIASES: Record<string, string[]> = {
  photosynthesis: ["photosynthesis","plant","plants","leaf","leaves","root","roots","stem","food","water","minerals","veins","stomata","stomatal","chlorophyll","sunlight","process","food making in plants","how plants make food"],
  "types of noun": ["noun","nouns","types of noun","types of nouns","common noun","proper noun","collective noun","abstract noun","material noun","countable noun","uncountable noun","concrete noun"],
  noun: ["noun","nouns","types of noun","types of nouns","common noun","proper noun","collective noun","abstract noun","material noun","countable noun","uncountable noun","concrete noun"],
  pronoun: ["pronoun","pronouns","personal pronoun","possessive pronoun","demonstrative pronoun","relative pronoun","reflexive pronoun","interrogative pronoun","indefinite pronoun","he","she","it","they","we","you","him","her","them","us","me","replace a noun","word that replaces a noun","words that replace nouns"],
  grammar: ["grammar","grammer","parts of speech","noun","pronoun","verb","adjective","adverb","conjunction","tense","tenses","sentence"],
  conjunction: ["conjunction","conjunctions","types of conjunction","coordinating conjunction","correlative conjunction","subordinating conjunction","fanboys","for and nor but or yet so","joining words","joining words and sentences"],
  tense: ["tense","tenses","present tense","simple present","present simple","present continuous","present progressive","past tense","simple past","future tense","simple future","verb tense","change the tense"],
  "present tense": ["present tense","simple present","present simple","present continuous","present progressive","am is are","do does","verb ing","daily routine","habit"],
  "present continuous": ["present continuous","present progressive","am is are","verb ing","verb + ing","-ing","happening now","action happening now"],
  summary: ["summary","summaries","summarize","summarise","summarizing","summarising","summary writing","write a summary","short summary","passage summary","main idea","central idea","gist","key points","brief account","précis","precis"],
  summarize: ["summary","summaries","summarize","summarise","summarizing","summarising","summary writing","write a summary","short summary","passage summary","main idea","central idea","gist","key points","brief account","précis","precis"],
  summarise: ["summary","summaries","summarize","summarise","summarizing","summarising","summary writing","write a summary","short summary","passage summary","main idea","central idea","gist","key points","brief account","précis","precis"],
  "unseen passage": ["unseen passage","unseen passages","passage","passages","reading comprehension","comprehension","comprehension passage","reading passage","unseen comprehension","extract","unseen extract","read and answer","read the passage and answer","comprehension questions","infer","inference","main idea","central idea","meaning in context","vocabulary in context"],
  comprehension: ["comprehension","reading comprehension","passage","reading passage","unseen passage","unseen comprehension","extract","comprehension questions","read and answer","infer","inference"],
  "reading comprehension": ["reading comprehension","comprehension","passage","unseen passage","reading passage","extract","comprehension questions","read and answer","infer","inference"],
  "data interpretation": ["data interpretation","interpret data","data analysis","chart","graph","table","bar graph","line graph","pie chart","data based questions"],
  "case based": ["case based","case study","case-based","caselet","competency based","competency based case","read the case","case based questions"],
  "source based": ["source based","source-based","source question","extract based","read the source","read the extract","source based questions"],
  "assertion reason": ["assertion reason","assertion and reason","assertion-reason","assertion","reason"],
};

function familyTokenSet(value: unknown): Set<string> {
  const tokens = tokenSet(value);
  const normalized = new Set<string>();
  for (const token of tokens) {
    normalized.add(token);
    if (token.endsWith("ies") && token.length > 4) normalized.add(`${token.slice(0, -3)}y`);
    else if (token.endsWith("ses") && token.length > 4) normalized.add(token.slice(0, -2));
    else if (token.endsWith("s") && token.length > 3) normalized.add(token.slice(0, -1));
  }
  return normalized;
}

function aliasLabels(value: unknown): string[] {
  const normalized = normalizeStudyBuddyText(value);
  if (!normalized) return [];
  const valueTokens = familyTokenSet(normalized);
  const labels = new Set<string>([normalized]);
  for (const [key, values] of Object.entries(TOPIC_ALIASES)) {
    const keyTokens = familyTokenSet(key);
    // Only treat phrases as the same family when they match on whole-word boundaries.
    // This is important for short concepts: `noun` must not absorb `pronoun`,
    // and `tense` must not absorb unrelated words merely because of a substring.
    const sameWords = normalized === key
      || normalized.startsWith(`${key} `)
      || normalized.endsWith(` ${key}`)
      || normalized.includes(` ${key} `)
      || key.startsWith(`${normalized} `)
      || key.endsWith(` ${normalized}`)
      || key.includes(` ${normalized} `);
    const valueContainsKey = keyTokens.size > 0 && Array.from(keyTokens).every(token => valueTokens.has(token));
    const keyContainsValue = valueTokens.size > 0 && Array.from(valueTokens).every(token => keyTokens.has(token));
    if (sameWords || valueContainsKey || keyContainsValue) {
      labels.add(key);
      values.forEach(x => labels.add(normalizeStudyBuddyText(x)));
    }
  }
  return Array.from(labels).filter(Boolean);
}

function topicAliasTokens(value: unknown): Set<string> {
  return new Set(aliasLabels(value).flatMap(x => x.split(" ")).filter(x => x.length >= 3 && !STOP_WORDS.has(x)));
}

function sourceContextScore(sourceContext: string, doubt: StudyBuddyDoubtSignal): number {
  const context = tokenSet(sourceContext), wanted = new Set([...topicAliasTokens(doubt.topic), ...topicAliasTokens(doubt.concept)]);
  let overlap = 0; for (const token of wanted) if (context.has(token)) overlap += token.length >= 7 ? 4 : 2;
  return Math.min(overlap * 2, 24);
}

function boundedEditDistance(a: string, b: string, limit = 1) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i]; let rowMin = curr[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > limit) return limit + 1;
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

function overlapScore(questionText: string, doubtText: string): number {
  const q = tokenSet(questionText), d = tokenSet(doubtText); if (!q.size || !d.size) return 0;
  let score = 0;
  for (const token of d) {
    if (q.has(token)) { score += token.length >= 7 ? 5 : token.length >= 5 ? 3 : 2; continue; }
    for (const candidate of q) {
      if (candidate.length < 5 || token.length < 5) continue;
      if (candidate === `${token}s` || candidate === `${token}es` || token === `${candidate}s` || token === `${candidate}es` || candidate.replace(/ies$/, "y") === token || token.replace(/ies$/, "y") === candidate || candidate.replace(/s$/, "") === token || token.replace(/s$/, "") === candidate) { score += 2; break; }
      if (candidate.endsWith("ing") && candidate.slice(0, -3) === token) { score += 2; break; }
      // OCR-tolerant bridge for one-character errors in meaningful words.
      if (Math.max(candidate.length, token.length) >= 7 && boundedEditDistance(candidate, token, 1) <= 1) { score += 2; break; }
    }
  }
  return score;
}

function uploadedTextScore(questionText: string, uploadedText: string): number {
  if (!uploadedText.trim()) return 0; const q = tokenSet(questionText), u = tokenSet(uploadedText); let common = 0;
  for (const token of q) if (u.has(token)) common += 1; return Math.min(common * 0.8, 12);
}

export interface StudyBuddyAttachmentSource {
  id: string; fileName: string; text: string;
  questionBlocks?: Array<{ text: string; sourceImageDataUrl?: string; sourcePage?: number; confidence?: number; blockContext?: string; sourceLines?: Array<{ text: string; x0?: number; x1?: number; y0?: number; y1?: number }>; visualReference?: boolean }>;
  sourceContext?: string;
}

export interface MatchResult { questions: MatchedStudyBuddyQuestion[]; matchedDoubts: string[]; unmatchedDoubts: string[]; totalCandidates: number; }

export function canonicalQuestionType(value: unknown): StudyBuddyQuestionType {
  const t = normalizeStudyBuddyText(value);
  if (!t) return "OTHER";
  const aliases: Array<[RegExp, StudyBuddyQuestionType]> = [
    [/^(?:mcq|mcqs|multiple choice|multiple choice question|objective|choose the correct|choose correct|select the correct|select correct)$/, "MCQ"],
    [/^(?:fill|fill blank|fill in blank|fill in the blank|fill blanks|fill in the blanks)$|complete the sentence|complete the following sentences/, "FILL_BLANK"],
    [/^(?:tf|true false|true or false|true false question)$|right wrong|correct incorrect|state\s+(?:whether|true|false)|tick.*true/, "TRUE_FALSE"],
    [/assertion.*reason|assertion reason|assertion and reason/, "ASSERTION_REASON"],
    [/match|matching|column a|column b|match.*following|match.*columns/, "MATCH_COLUMNS"],
    [/word sorting|word sort|sort words|classify words|word classification/, "WORD_SORTING"],
    [/case based|case study|case[- ]based|competency based case/, "CASE_BASED"],
    [/source based|source[- ]based|read the extract|read the source/, "SOURCE_BASED"],
    [/data interpretation|interpret.*data|table.*data|graph.*data|chart.*data/, "DATA_INTERPRETATION"],
    [/unseen passage|reading comprehension|comprehension|passage/, "READING_COMPREHENSION"],
    [/diagram.*label|label.*diagram|label the parts/, "DIAGRAM_LABEL"],
    [/image based|image based question|picture based|look at the picture|observe the image/, "IMAGE_BASED"],
    [/odd one out|odd.*out|does not belong/, "ODD_ONE_OUT"],
    [/rearrange|jumbled|unscramble|reorder/, "REARRANGE"],
    [/correct the sentence|correct.*sentences|rewrite.*correct/, "CORRECT_THE_SENTENCE"],
    [/complete.*table|fill.*table|complete.*chart/, "COMPLETE_TABLE"],
    [/sequence|put.*order|arrange.*sequence/, "SEQUENCE_ORDER"],
    [/one word|one-word|answer in one word/, "ONE_WORD"],
    [/give reasons?|give a reason|state reason/, "GIVE_REASON"],
    [/differentiate|distinguish|difference between|compare.*contrast/, "DIFFERENTIATE_COMPARE"],
    [/transform|change.*tense|change.*voice|change.*degree|rewrite.*as/, "GRAMMAR_TRANSFORMATION"],
    [/^(?:very short|vsa|vsaq|very short answer)$|one or two words/, "VERY_SHORT_ANSWER"],
    [/identify|underline|circle|find the|find all|name the/, "IDENTIFY_UNDERLINE"],
    [/^(?:long|long answer|long answer question)$|descriptive|essay|elaborate|in detail|detailed answer/, "LONG_ANSWER"],
    [/^(?:short|short answer|short answer question)$|briefly|answer briefly/, "SHORT_ANSWER"],
  ];
  for (const [pattern, type] of aliases) if (pattern.test(t)) return type;
  return "OTHER";
}

function stripDocumentArtifacts(value: string, preserveLines = false) {
  value = value
    .replace(/\b(?:for answer and help visit|free printable)\b[\s\S]*$/i, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+\d+\s*\/\s*\d+\s+(?:\d{2}\/\d{2}\/\d{4}.*)?$/i, "")
    .replace(/\s+\d+\s*\/\s*\d+\s*$/i, "");
  return preserveLines
    ? value.split(/\r?\n/).map(line => line.replace(/[ \t]+/g, " ").trim()).filter(Boolean).join("\n")
    : value.replace(/\s+/g, " ").trim();
}

interface Candidate { question: StudyBuddyQuestion; worksheet: StudyBuddyWorksheet; score: number; matchedDoubts: string[]; sourceKey: string; typeKey: string; }

function normalizeAttachmentOcrText(value: string) {
  return clean(value).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+([,.;:!?])/g, "$1");
}

function optionMatches(text: string) {
  const matches = Array.from(text.matchAll(/(?:^|[\s|])(?:\(([1-4]|i{1,3}|iv|v)\)|\(?([A-D])\)?[.)\-:])\s*(.+?)(?=(?:\s+|\|)(?:\((?:[1-4]|i{1,3}|iv|v)\)|\(?[A-D]\)?[.)\-:])\s*|$)/gi));
  return matches.filter(match => {
    const before = text.slice(0, match.index ?? 0);
    return !/(?:assertion|reason)\s*$/i.test(before.slice(-20));
  }).map(match => {
    const label = match[1] ?? match[2];
    const optionText = match[3] ?? "";
    // Keep the same [label,text] shape used by the existing parser.
    (match as any)[1] = label;
    (match as any)[2] = optionText;
    return match;
  });
}

function splitOptions(text: string) {
  const normalized = normalizeAttachmentOcrText(text).replace(/\s{2,}/g, " ");
  const matches = optionMatches(normalized);
  const options = matches.map(m => String(m[2] ?? "").trim()).filter(Boolean);
  let stem = normalized;
  if (matches.length >= 2) {
    const firstIndex = matches[0].index ?? -1;
    if (firstIndex >= 0) stem = normalized.slice(0, firstIndex).trim();
  }
  return { normalized, stem, options, labels: matches.map(m => String(m[1])) };
}

function hasBlankMarker(text: string) { return /_{2,}|\.{4,}|_{1,}\s+(?:\(|$)/.test(text) || /\b(?:blank|blanks)\b/i.test(text); }

function looksLikeInstruction(line: string) {
  return /^(?:instruction|instructions|read|choose|select|circle|tick|underline|match|write|fill|complete|identify|find|state|answer|look|observe|name|give|differentiate|distinguish|rearrange|correct|put|arrange)\b/i.test(line.trim());
}

function extractTrueFalseStatement(stem: string) {
  return stem.replace(/^\s*\d{1,3}\s*[.)\-:;,]\s*/i, "").replace(/^\s*(?:state\s+)?(?:whether\s+)?(?:the\s+statement\s+is\s+)?true\s+or\s+false\s*[:\-]?\s*/i, "").trim();
}

function parseAssertionReason(text: string) {
  const normalized = normalizeAttachmentOcrText(text);
  const a = normalized.match(/assertion\s*\(?a\)?\s*[:\-]\s*([\s\S]*?)(?=reason\s*\(?r\)?\s*[:\-]|$)/i);
  const r = normalized.match(/reason\s*\(?r\)?\s*[:\-]\s*([\s\S]*?)(?=(?:(?:\(?[A-D]\)?[.)\-:]|\((?:[1-4]|i{1,3}|iv|v)\))\s+)|$)/i);
  if (!a || !r) return null;
  const optionResult = splitOptions(normalized);
  return { assertion: a[1].trim(), reason: r[1].trim(), options: optionResult.options };
}

function parseMatchColumns(text: string, sourceLines?: StudyBuddyAttachmentSource["questionBlocks"][number]["sourceLines"]) {
  const source = String(text ?? "").replace(/\r/g, "");
  const normalized = normalizeAttachmentOcrText(source);

  const cleanGeneratedToken = (value: string) => {
    let v = String(value ?? "").replace(/[\uFFFE\uFFFD]/g, " ").replace(/\s+/g, " ").trim();
    // Generated worksheet builders sometimes serialize implementation IDs between
    // the column marker and the human-readable item. IDs are alphanumeric and
    // contain at least one digit; ordinary worksheet text is retained.
    v = v.replace(/\b(?:column\s*[ab]|columna|columnb)\s*[\uFFFE\uFFFD\-:]?\s*(?:\d{6,}\s*[-:]?)?/gi, " ");
    v = v.replace(/\b[a-z0-9]{5,16}\b/gi, token => /\d/.test(token) ? " " : token);
    v = v.replace(/\s+/g, " ").trim();
    return v;
  };

  const markerFor = (side: "A" | "B") => side === "A"
    ? /\b(?:column\s*a|columna)\s*[\uFFFE\uFFFD\-:]?\s*\d{6,}\s*[-:]?/gi
    : /\b(?:column\s*b|columnb)\s*[\uFFFE\uFFFD\-:]?\s*\d{6,}\s*[-:]?/gi;

  const extractGeneratedRows = (body: string, side: "A" | "B") => {
    const re = markerFor(side);
    const rawBody = String(body ?? "");
    const other = markerFor(side === "A" ? "B" : "A");
    const otherMatch = other.exec(rawBody);
    const scoped = side === "A"
      ? (otherMatch && (otherMatch.index ?? -1) >= 0 ? rawBody.slice(0, otherMatch.index) : rawBody)
      : (otherMatch && (otherMatch.index ?? -1) >= 0 ? rawBody.slice(otherMatch.index) : rawBody);
    re.lastIndex = 0;
    const rows: string[] = [];
    const matches = Array.from(scoped.matchAll(re));
    for (let i = 0; i < matches.length; i += 1) {
      const match = matches[i];
      const start = (match.index ?? 0) + match[0].length;
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? scoped.length) : scoped.length;
      const segment = cleanGeneratedToken(scoped.slice(start, end));
      if (segment) rows.push(segment);
    }
    return rows;
  };

  // Handle serialized builder rows before generic header parsing. This is essential
  // when a teacher worksheet stores each row as columnA-id/text rather than plain labels.
  const generatedA = extractGeneratedRows(source, "A");
  const generatedB = extractGeneratedRows(source, "B");
  if (generatedA.length && generatedB.length) return { columnA: generatedA, columnB: generatedB };

  const headerPair = normalized.match(/\b(?:column\s+a|list\s+i\b|left\s+column)\b\s*[:\-]?([\s\S]*?)\b(?:column\s+b|list\s+ii\b|right\s+column)\b\s*[:\-]?([\s\S]*)$/i);
  if (headerPair) {
    const parseLabeledItems = (body: string) => body
      .split(/(?=(?:^|\s)(?:\(?\d+\)?|\(?[a-z]\)?|\(?i{1,3}\)?|\(?iv\)?|\(?v\)?)\s*[.)\-:]\s+)/i)
      .map(x => x.trim())
      .filter(Boolean)
      .map(x => x.replace(/^\s*(?:\(?\d+\)?|\(?[a-z]\)?|\(?i{1,3}\)?|\(?iv\)?|\(?v\)?)\s*[.)\-:]\s*/i, "").trim())
      .map(cleanGeneratedToken)
      .filter(x => x.length > 0 && !/^(?:column\s*[ab]|list\s*(?:i|ii)|left|right)$/i.test(x));
    const columnA = parseLabeledItems(headerPair[1]);
    const columnB = parseLabeledItems(headerPair[2]);
    if (columnA.length && columnB.length) return { columnA, columnB };
  }

  // Layout-aware recovery. This handles photographed/PDF sources where the two
  // columns are separate spatial regions and rows have normal labels.
  if (sourceLines?.length) {
    const lines = sourceLines.filter(l => clean(l.text));
    const x0s = lines.map(l => Number(l.x0)).filter(Number.isFinite);
    const x1s = lines.map(l => Number(l.x1)).filter(Number.isFinite);
    const split = x0s.length && x1s.length ? (Math.min(...x0s) + Math.max(...x1s)) / 2 : null;
    const a: string[] = [], b: string[] = [];
    let side: "A" | "B" | "" = "";
    for (const line of lines) {
      const t = normalizeAttachmentOcrText(line.text || "");
      if (/^column\s+a$|^list\s+i$/i.test(t)) { side = "A"; continue; }
      if (/^column\s+b$|^list\s+ii$/i.test(t)) { side = "B"; continue; }
      if (!side || /^column[ab]/i.test(t)) continue;
      const labelled = t.match(/^(?:\()?([0-9]+|[a-z]|i{1,3}|iv|v)(?:\)?)\s*[.)\-:]\s+(.+)$/i);
      if (!labelled) continue;
      const value = cleanGeneratedToken(labelled[2]);
      if (!value) continue;
      const label = labelled[1];
      if (/^\d+$/.test(label) || /^(?:i{1,3}|iv|v)$/i.test(label)) a.push(value);
      else b.push(value);
    }
    if (a.length && b.length) return { columnA: a, columnB: b };
    if (split !== null) {
      const left: string[] = [], right: string[] = [];
      for (const line of lines) {
        const t = normalizeAttachmentOcrText(line.text || "");
        if (/^column\s+[ab]$|^list\s+(?:i|ii)$/i.test(t)) continue;
        const value = cleanGeneratedToken(t.replace(/^(?:\()?([0-9]+|[a-z]|i{1,3}|iv|v)(?:\)?)\s*[.)\-:]\s*/i, ""));
        if (!value) continue;
        if (Number(line.x0 ?? 0) < split) left.push(value); else right.push(value);
      }
      if (left.length && right.length) return { columnA: left, columnB: right };
    }
  }

  // Compact text-only fallback: 1. item  a. item 2. item b. item.
  const compactA: string[] = [], compactB: string[] = [];
  for (const line of normalized.split(/\n+/)) {
    const labels = [...line.matchAll(/(?:^|\s)(?:\()?([0-9]+|[a-z]|i{1,3}|iv|v)(?:\)?)\s*[.)\-:]\s+/gi)];
    if (labels.length < 2) continue;
    const numeric = labels.filter(m => /^\d+$/.test(String(m[1])) || /^(?:i{1,3}|iv|v)$/i.test(String(m[1])));
    const alpha = labels.filter(m => /^[a-z]$/i.test(String(m[1])));
    for (const m of numeric) {
      const pos = m.index ?? 0;
      const nextAlpha = alpha.find(a => (a.index ?? 0) > pos);
      const end = nextAlpha ? (nextAlpha.index ?? line.length) : line.length;
      const body = cleanGeneratedToken(line.slice(pos, end).replace(/^\s*(?:\()?([0-9]+|[a-z]|i{1,3}|iv|v)(?:\)?)\s*[.)\-:]\s*/i, ""));
      if (body) compactA.push(body);
    }
    for (const m of alpha) {
      const pos = m.index ?? 0;
      const nextNumeric = numeric.find(n => (n.index ?? 0) > pos);
      const end = nextNumeric ? (nextNumeric.index ?? line.length) : line.length;
      const body = cleanGeneratedToken(line.slice(pos, end).replace(/^\s*(?:\()?([0-9]+|[a-z]|i{1,3}|iv|v)(?:\)?)\s*[.)\-:]\s*/i, ""));
      if (body) compactB.push(body);
    }
  }
  if (compactA.length && compactB.length) return { columnA: compactA, columnB: compactB };
  return null;
}

function splitItemsByRepeatedStructure(text: string, pattern: RegExp): string[] {
  const lines = text.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const hits: string[] = [];
  for (const line of lines) {
    if (pattern.test(line)) hits.push(line.replace(/^[-•●▪◦]\s*/, "").trim());
  }
  return hits;
}

function inferAttachmentQuestionType(text: string, block?: { sourceLines?: StudyBuddyAttachmentSource["questionBlocks"][number]["sourceLines"]; visualReference?: boolean; visualImageDataUrl?: string; blockContext?: string }): StudyBuddyQuestionType {
  const raw = normalizeAttachmentOcrText(text);
  const value = normalizeStudyBuddyText(raw);
  // Highest-priority structural types first. Generic option detection is deliberately last.
  if (/assertion\s*\(?a\)?\s*[:\-]/i.test(raw) && /reason\s*\(?r\)?\s*[:\-]/i.test(raw)) return "ASSERTION_REASON";
  if (/\b(?:column\s*a|column\s*b)\b|match\s+(?:the\s+)?following|match\s+(?:the\s+)?columns/i.test(raw)) return "MATCH_COLUMNS";
  if (/cut\s+and\s+paste|sort\s+the\s+words|classify\s+the\s+words|correct\s+box/i.test(raw) && /\bverb\b[\s\S]*\bnoun\b/i.test(raw)) return "WORD_SORTING";
  if (/case\s+study|case\s+based|read\s+the\s+following\s+(?:case|scenario)/i.test(raw)) return "CASE_BASED";
  if (/source\s+based|read\s+(?:the\s+)?(?:following\s+)?(?:source|extract)|source\s*:/i.test(raw)) return "SOURCE_BASED";
  if (/data\s+interpretation|study\s+the\s+(?:following\s+)?(?:table|graph|chart|data)/i.test(raw)) return "DATA_INTERPRETATION";
  if (/unseen\s+passage|reading\s+comprehension|comprehension|read\s+the\s+passage/i.test(raw)) return "READING_COMPREHENSION";
  if (/diagram\s+(?:and\s+)?label|label\s+the\s+(?:following\s+)?(?:diagram|parts)/i.test(raw)) return "DIAGRAM_LABEL";
  if (/look\s+at\s+(?:the\s+)?(?:image|picture)|observe\s+(?:the\s+)?image|image\s+based|picture\s+based/i.test(raw)) return "IMAGE_BASED";
  if (/true\s*\/\s*false|true\s+or\s+false|state\s+(?:whether|true|false)|right\s*\/\s*wrong|correct\s*\/\s*incorrect/i.test(raw)) return "TRUE_FALSE";
  if (/fill\s+in\s+the\s+blank|fill\s+in\s+the\s+blanks|complete\s+the\s+(?:sentence|sentences)|_{1,}|\.{4,}/i.test(raw)) return "FILL_BLANK";
  if (/^\s*(?:\d{1,3}\s*[.)\-:]\s*)?\(?a\)?\s+.{5,}$/i.test(raw) && optionMatches(raw).length < 2 && /\b(?:is|are|was|were|has|have|can|will|used|known|called)\b/i.test(raw)) return "FILL_BLANK";
  if (/odd\s+one\s+out|does\s+not\s+belong/i.test(raw)) return "ODD_ONE_OUT";
  if (/rearrange|jumbled|unscramble|reorder/i.test(raw)) return "REARRANGE";
  if (/correct\s+the\s+sentence|correct\s+the\s+following/i.test(raw)) return "CORRECT_THE_SENTENCE";
  if (/complete\s+the\s+(?:following\s+)?(?:table|chart)|fill\s+the\s+table/i.test(raw)) return "COMPLETE_TABLE";
  if (/put.*order|arrange.*sequence|sequence\s+of/i.test(raw)) return "SEQUENCE_ORDER";
  if (/answer\s+in\s+one\s+word|one[- ]word/i.test(raw)) return "ONE_WORD";
  if (/give\s+(?:a\s+)?reason|give\s+reasons|state\s+(?:the\s+)?reason/i.test(raw)) return "GIVE_REASON";
  if (/differentiate|distinguish|difference\s+between|compare\s+and\s+contrast/i.test(raw)) return "DIFFERENTIATE_COMPARE";
  if (/change\s+(?:the\s+)?(?:sentence|word|words)?\s*into|transform|rewrite.*(?:tense|voice|degree)/i.test(raw)) return "GRAMMAR_TRANSFORMATION";
  if (/answer\s+in\s+one\s+word|one[- ]word/i.test(raw)) return "ONE_WORD";
  if (/very\s+short|one\s+or\s+two\s+words/i.test(value)) return "VERY_SHORT_ANSWER";
  if (/underline|circle|identify|find\s+the|find\s+all|name\s+the/i.test(raw) && optionMatches(raw).length < 2) return "IDENTIFY_UNDERLINE";
  const optionCount = optionMatches(raw).length;
  if (optionCount >= 2) return "MCQ";
  if (/very\s+short|one\s+or\s+two\s+words/i.test(value)) return "VERY_SHORT_ANSWER";
  if (/\b[1-2]\s*marks?\b/i.test(value) && /\b(?:answer|question)\b/i.test(value)) return "VERY_SHORT_ANSWER";
  if (/long\s+answer|in\s+detail|detailed\s+answer|elaborate|essay|discuss/i.test(value)) return "LONG_ANSWER";
  if (/short\s+answer|briefly|answer\s+briefly/i.test(value)) return "SHORT_ANSWER";
  if (/define|what\s+is|what\s+are|why\b|how\b|explain|describe|state|name|list|write/i.test(value)) return "SHORT_ANSWER";
  return "OTHER";
}

function parseFillItems(text: string) {
  const lines = text.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const items: Array<{ sentence: string; blank: string; id: string }> = [];
  for (const line of lines) {
    if (/^(?:name|class|date|instruction|instructions|worksheet|for answer|answer key|solutions?)\b/i.test(line)) continue;
    let stripped = line.replace(/^[-•●▪◦]\s*/, "").replace(/^(?:\d+)[.)\-:]\s*/i, "").trim();
    // Some worksheet PDFs encode an empty fill position as "(a)    is ..."
    // rather than underscores. In that case the (a) is the blank marker, not an MCQ option.
    if (/^\(?a\)?\s+.{5,}$/i.test(stripped) && !/\(?[B-D]\)?[.)\-:]/i.test(stripped)) {
      const sentence = stripped.replace(/^\(?a\)?\s+/i, "").trim();
      items.push({ sentence: `____ ${sentence}`, blank: "", id: String(items.length + 1) });
      continue;
    }
    if (!hasBlankMarker(stripped)) continue;
    items.push({ sentence: stripped, blank: "", id: String(items.length + 1) });
  }
  return items;
}

function parseWordSorting(text: string) {
  const value = normalizeAttachmentOcrText(text);
  const heading = value.match(/\bverb\b\s+\bnoun\b([\s\S]*)/i);
  if (!heading) return null;
  const tail = heading[1].replace(/\bfor\s+answer\s+and\s+help\s+visit\b[\s\S]*$/i, "");
  const words = [...tail.matchAll(/\b[A-Za-z][A-Za-z\'-]{1,}\b/g)].map(m => m[0]);
  const combined = Array.from(new Set(words));
  if (combined.length >= 5) return { categories: ["Verb", "Noun"], wordBank: combined, items: combined };
  return null;
}

function extractMarks(text: string) {
  const patterns = [
    /(?:\(|\[)\s*(\d+(?:\.\d+)?)\s*(?:marks?|m)\s*(?:\)|\])/i,
    /\b(\d+(?:\.\d+)?)\s*marks?\b/i,
  ];
  for (const pattern of patterns) { const match = text.match(pattern); if (match) return Number(match[1]); }
  return 0;
}

function extractInstruction(blockContext: string) {
  const value = clean(blockContext);
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function hasAttachmentQuestionEvidence(text: string, block: { visualReference?: boolean; visualImageDataUrl?: string; blockContext?: string }) {
  const value = `${text} ${block.blockContext ?? ""}`;
  if (block.visualReference || block.visualImageDataUrl) return true;
  if (/^(?:(?:q(?:uestion)?\s*)?\d{1,3})\s*[.)\-:;,]/im.test(text)) return true;
  if (/[?]/.test(text)) return true;
  return /_{1,}|\.{4,}|\b(?:fill\s+in\s+the\s+blank|match\s+(?:the\s+)?following|true\s*\/?\s*false|assertion|reason|choose|select|identify|find|underline|circle|state|write|complete|rearrange|correct|sort|classify|answer|give|differentiate|distinguish|observe|look\s+at)\b/i.test(value);
}

function parseAttachmentQuestionBlock(source: StudyBuddyAttachmentSource, block: { text: string; sourceImageDataUrl?: string; sourcePage?: number; confidence?: number; blockContext?: string; sourceLines?: StudyBuddyAttachmentSource["questionBlocks"][number]["sourceLines"]; visualReference?: boolean; visualImageDataUrl?: string }, index: number): StudyBuddyQuestion | null {
  const rawOriginal = clean(block.text);
  const layoutText = block.sourceLines?.map(line => clean(line.text)).filter(Boolean).join("\n") || rawOriginal;
  const original = stripDocumentArtifacts(rawOriginal);
  const layoutOriginal = stripDocumentArtifacts(layoutText, true);
  if (original.length < 5 && layoutOriginal.length < 5) return null;
  if (/^(?:name|class|date|worksheet|for answer and help|www\.)\b/i.test(original)) return null;
  const primaryType = inferAttachmentQuestionType(original, block);
  const layoutType = primaryType === "OTHER" ? inferAttachmentQuestionType(layoutOriginal, block) : primaryType;
  const type = layoutType === "OTHER" ? inferAttachmentQuestionType(`${original} ${block.blockContext ?? ""}`, block) : layoutType;
  if (type === "OTHER" && !hasAttachmentQuestionEvidence(`${original}\n${layoutOriginal}`, block)) return null;
  const instruction = extractInstruction(block.blockContext ?? "");
  const marks = extractMarks(original);
  const numberMatch = original.match(/^(?:(?:q(?:uestion)?\s*)?(\d{1,3}))\s*[.)\-:;,]/i);
  const sourceQuestionNumber = numberMatch?.[1];
  const { normalized, stem, options, labels } = splitOptions(layoutOriginal || original);
  const stripped = stem.replace(/^(?:(?:q(?:uestion)?\s*)?\d{1,3}\s*[.)\-:;,]\s*)/i, "").trim();

  // Activity-level worksheet blocks.
  if (/cut\s+and\s+paste|correct\s+box|sort\s+the\s+words|classify\s+the\s+words/i.test(normalized) && /\bverb\b[\s\S]*\bnoun\b/i.test(normalized)) {
    const sorting = parseWordSorting(layoutOriginal);
    return { id: `attachment-${source.id}-${index + 1}`, type: "WORD_SORTING", question: stripped || "Sort the words into the correct boxes.", categories: sorting?.categories ?? ["Category 1", "Category 2"], items: sorting?.items ?? [], wordBank: sorting?.wordBank ?? [], marks, sourceImageDataUrl: block.sourceImageDataUrl, sourcePage: block.sourcePage, sourceConfidence: block.confidence, sourceFidelity: block.sourceImageDataUrl ? "original-snapshot" : "text-extracted", sourceFileName: source.fileName, sourceContext: [source.fileName, block.blockContext ?? ""].filter(Boolean).join(" "), sourceOriginalText: layoutOriginal || rawOriginal, sourceLines: block.sourceLines, instruction, sourceQuestionNumber, visualReference: block.visualReference, visualImageDataUrl: block.visualImageDataUrl };
  }

  if (type === "FILL_BLANK") {
    const fillItems = parseFillItems(layoutOriginal);
    const sentence = fillItems[0]?.sentence || rawOriginal.replace(/^(?:(?:q(?:uestion)?\s*)?\d{1,3}\s*[.)\-:;,]\s*)/i, "").trim();
    return { id: `attachment-${source.id}-${index + 1}`, type, question: sentence || rawOriginal, fillSentence: sentence || rawOriginal, blanks: fillItems.map(x => x.blank), fillItems: fillItems.length ? fillItems : [{ sentence: sentence || rawOriginal, blank: "", id: "1" }], marks, sourceImageDataUrl: block.sourceImageDataUrl, sourcePage: block.sourcePage, sourceConfidence: block.confidence, sourceFidelity: block.sourceImageDataUrl ? "original-snapshot" : "text-extracted", sourceFileName: source.fileName, sourceContext: [source.fileName, block.blockContext ?? ""].filter(Boolean).join(" "), sourceOriginalText: layoutOriginal || rawOriginal, sourceLines: block.sourceLines, instruction, sourceQuestionNumber, visualReference: block.visualReference, visualImageDataUrl: block.visualImageDataUrl };
  }

  const base: StudyBuddyQuestion = { id: `attachment-${source.id}-${index + 1}`, type, question: stripped || normalized, marks, sourceImageDataUrl: block.sourceImageDataUrl, sourcePage: block.sourcePage, sourceConfidence: block.confidence, sourceFidelity: block.sourceImageDataUrl ? "original-snapshot" : "text-extracted", sourceFileName: source.fileName, sourceContext: [source.fileName, block.blockContext ?? ""].filter(Boolean).join(" "), sourceOriginalText: layoutOriginal || rawOriginal, sourceLines: block.sourceLines, instruction, sourceQuestionNumber, visualReference: block.visualReference, visualImageDataUrl: block.visualImageDataUrl };

  if (type === "MCQ") { base.options = options; base.optionLabels = labels; if (options.length < 2) return null; }
  else if (type === "TRUE_FALSE") { base.question = stripped.replace(/^state\s+true\s+or\s+false\s*[:\-]?/i, "").trim() || stripped; base.statements = [extractTrueFalseStatement(stripped)].filter(Boolean); if (options.length) { base.options = options; base.optionLabels = labels; } }
  else if (type === "ASSERTION_REASON") { const ar = parseAssertionReason(layoutOriginal || rawOriginal); if (ar) { base.question = "Assertion and Reason"; base.assertion = ar.assertion; base.reason = ar.reason; base.assertionOptions = ar.options; base.options = ar.options; } }
  else if (type === "MATCH_COLUMNS") { const match = parseMatchColumns(layoutOriginal || rawOriginal, block.sourceLines); if (match) { base.columnA = match.columnA.map((x, i) => ({ id: String(i + 1), text: x })); base.columnB = match.columnB.map((x, i) => ({ id: String.fromCharCode(97 + i), text: x })); base.question = stripped.replace(/\s+(?:column\s+a|column\s+b)\b[\s\S]*$/i, "").trim() || "Match the following"; } else { base.question = stripped.replace(/\s+(?:column\s+a|column\s+b)\b[\s\S]*$/i, "").trim() || "Match the following"; } }
  else if (["IDENTIFY_UNDERLINE","ODD_ONE_OUT","REARRANGE","CORRECT_THE_SENTENCE","ONE_WORD","GIVE_REASON","DIFFERENTIATE_COMPARE","GRAMMAR_TRANSFORMATION","VERY_SHORT_ANSWER","SHORT_ANSWER","LONG_ANSWER","SEQUENCE_ORDER","COMPLETE_TABLE"].includes(type)) {
    base.items = splitItemsByRepeatedStructure(layoutOriginal || original, /^(?:[-•●▪◦]|\d+\.|[a-z]\))/i);
    if (!base.items?.length) base.items = [stripped || normalized];
  }
  else if (["CASE_BASED","SOURCE_BASED","DATA_INTERPRETATION","READING_COMPREHENSION"].includes(type)) {
    base.passage = stripped || normalized;
    base.passageQuestions = [];
  }
  return base;
}

function splitNumberedQuestionBlocks(text: string): string[] {
  const rawLines = String(text ?? "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const output: string[] = [];
  let current: string[] = [];
  let currentNumber = 0;
  let started = false;

  const flush = () => {
    const value = current.join("\n").trim();
    if (value) output.push(value);
    current = [];
  };

  for (const rawLine of rawLines) {
    const line = normalizeAttachmentOcrText(rawLine);
    if (!line) continue;
    if (/^(?:name|class|date|worksheet|total\s+questions?|worksheet\s+time|free\s+printable|english\s+grammar|grammar\s+worksheets?|for\s+answer|answer\s+key|solutions?|www\.|https?:\/\/|\d+\/\d+)\b/i.test(line)) continue;

    const match = line.match(/^(?:(?:q(?:uestion)?\s*)?(\d{1,3}))\s*[.)\-:;,]\s*(.*)$/i);
    if (match) {
      const number = Number(match[1]);
      const rest = String(match[2] ?? "").trim();
      // Only increasing top-level numbers start a new question. This prevents
      // numbered sub-items in an already detected matching/table activity from
      // being split accidentally.
      if (!started || number > currentNumber) {
        flush();
        started = true;
        currentNumber = number;
        current.push(rest ? `${match[1]}. ${rest}` : `${match[1]}.`);
        continue;
      }
    }

    if (started) {
      // Options, continuation lines, source passages, and answer choices all
      // belong to the active numbered question until the next top-level number.
      current.push(line);
    }
  }
  flush();
  return output;
}

function splitUnnumberedQuestionBlocks(text: string): string[] {
  const normalizedText = String(text ?? "");
  const rawLines = normalizedText.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const lines = rawLines.filter(line => !/^(?:.*\bworksheet\b|name|class|date|instruction(?:s)?\s*[:\-]?|for answer and help|www\.)/i.test(line));
  if (!lines.length) return [];

  // If the source contains an explicit numbered question sequence, preserve
  // each numbered question together with every following option/continuation
  // line. This is the primary path for Indian school worksheets/question papers.
  const numberedStarts = lines.filter(line => /^(?:(?:q(?:uestion)?\s*)?\d{1,3})\s*[.)\-:;,]/i.test(line));
  if (numberedStarts.length >= 1) {
    // A Match/List activity with numbered pairs is one activity, not N questions.
    if (/(?:column\s+a|list\s+i)\b[\s\S]*(?:column\s+b|list\s+ii)\b/i.test(normalizedText) && /match\s+(?:the\s+)?following|match\s+the\s+columns/i.test(normalizedText)) {
      return [lines.join("\n")];
    }
    const numbered = splitNumberedQuestionBlocks(normalizedText);
    if (numbered.length) return numbered;
  }

  if (/cut\s+and\s+paste|correct\s+box/i.test(lines.join(" ")) && /\bverb\b[\s\S]*\bnoun\b/i.test(lines.join(" "))) return [lines.join("\n")];
  const fillCount = lines.filter(line => hasBlankMarker(line)).length;
  if (fillCount >= 3) return [lines.join("\n")];

  const output: string[] = []; let current = "";
  const start = (line: string, next = "", nextTwo = "") => {
    if (/^(?:answer|answers|solution|solutions|answer key|solutions key)\s*[:\-]?$/i.test(line)) return false;
    if (/^(?:[-•●▪◦])\s+/.test(line)) return true;
    // Never treat an option row as a new question. It belongs to the preceding stem.
    if (/^\(?[A-D]\)?\s*[.)\-:]\s+/i.test(line)) return false;
    if (/assertion\s*\(?a\)?\s*:|reason\s*\(?r\)?\s*:|state\s+true\s+or\s+false|match\s+(?:the\s+)?following/i.test(line)) return true;
    if (optionMatches(line).length >= 2) return false;
    if (current === "" && (optionMatches(next).length >= 2 || optionMatches(nextTwo).length >= 2)) return true;
    if (/\?$/.test(line)) return true;
    if (/^(?:define|explain|describe|discuss|why\b|how\b|what\s+(?:is|are)\b|who\b|where\b|when\b|identify\b|find\b|state\b|name\b|list\b|write\b|choose\b|select\b|pick\b)/i.test(line)) return true;
    return false;
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (start(line, lines[i + 1] ?? "", lines[i + 2] ?? "")) {
      if (current) output.push(current.trim());
      current = line;
    } else if (current) current += `\n${line}`;
  }
  if (current) output.push(current.trim());
  return output.length ? output : [lines.join("\n")];
}

function parseAttachmentQuestions(source: StudyBuddyAttachmentSource): StudyBuddyWorksheet {
  let blocks = Array.isArray(source.questionBlocks) && source.questionBlocks.length ? source.questionBlocks : [];
  if (!blocks.length && source.text.trim()) blocks = splitUnnumberedQuestionBlocks(source.text).map(text => ({ text }));
  if (blocks.length === 1 && source.text.trim()) {
    const single = blocks[0].text;
    // Re-segment only when the block is clearly an aggregate of independent questions.
    const segmented = splitUnnumberedQuestionBlocks(single);
    if (segmented.length > 1 && !/cut\s+and\s+paste|correct\s+box/i.test(single) && !(/_{2,}|\.{4,}/.test(single) && segmented.length === 1)) {
      blocks = segmented.map((text, i) => ({ ...blocks[0], text, sourceLines: i === 0 ? blocks[0].sourceLines : undefined }));
    }
  }
  const parsed = blocks.map((block, index) => parseAttachmentQuestionBlock(source, block, index)).filter((x): x is StudyBuddyQuestion => Boolean(x));
  // A single worksheet activity block can contain many independently answerable items
  // (the supplied noun worksheet has 20 fill-in-the-blank items). Expand those items into
  // separate paper questions so none is lost merely because the source has one shared instruction.
  const questions = parsed.flatMap((question, index) => {
    if (question.type !== "FILL_BLANK" || !Array.isArray(question.fillItems) || question.fillItems.length <= 1) return [question];
    return question.fillItems.map((item, itemIndex) => ({
      ...question,
      id: `${question.id}-item-${itemIndex + 1}`,
      question: String(item.sentence ?? question.question),
      fillSentence: String(item.sentence ?? question.fillSentence ?? question.question),
      blanks: [String(item.blank ?? "")],
      fillItems: [{ ...item, id: String(itemIndex + 1) }],
      sourceQuestionNumber: `${question.sourceQuestionNumber ?? index + 1}.${itemIndex + 1}`,
      sourceOriginalText: String(item.sentence ?? question.sourceOriginalText ?? question.question),
    }));
  });
  return { id: `attachment-source-${source.id}`, teacherUuid: "student-attachment", teacherName: "Your attached file", subjectName: "", chapterName: source.sourceContext || "Attached question paper", publishedAt: new Date().toISOString(), title: source.fileName, payload: { questions, attachmentSourceContext: source.sourceContext ?? source.fileName } };
}

function buildDoubtLabels(doubts: StudyBuddyDoubtSignal[]): string[] {
  const labels: string[] = [], seen = new Set<string>();
  for (const doubt of doubts) for (const value of [doubt.topic, doubt.concept]) { const normalized = normalizeStudyBuddyText(value); if (!normalized || seen.has(normalized)) continue; seen.add(normalized); labels.push(clean(value)); }
  return labels;
}

function isGeneratedMatchId(value: unknown) {
  const text = clean(value).replace(/[\uFFFE\uFFFD]/g, "");
  return /^(?:column\s*[ab]|columna|columnb)\s*[-:]?\s*\d{6,}[-:]?$/i.test(text) || /^(?=.*\d)[a-z0-9]{5,16}[-:]?$/i.test(text);
}

function cleanMatchDisplayValue(value: unknown) {
  let text = clean(value).replace(/[\uFFFE\uFFFD]/g, " ").replace(/\s+/g, " ").trim();
  text = text.replace(/^(?:column\s*[ab]|columna|columnb)\s*[\uFFFE\uFFFD\-:]?\s*(?:\d{6,}\s*[-:]?)?\s*/i, "").trim();
  text = text.replace(/\b(?:column\s*[ab]|columna|columnb)\s*[\uFFFE\uFFFD\-:]?\s*(?:\d{6,}\s*[-:]?)?/gi, " ").replace(/\s+/g, " ").trim();
  if (isGeneratedMatchId(text)) return "";
  return text;
}

function extractHumanMatchValue(item: any) {
  if (typeof item === "string") return cleanMatchDisplayValue(item);
  if (!item || typeof item !== "object") return "";
  const preferred = [item.text, item.value, item.label, item.content, item.displayText, item.name, item.title, item.description];
  for (const value of preferred) {
    const cleaned = cleanMatchDisplayValue(value);
    if (cleaned) return cleaned;
  }
  for (const value of Object.values(item)) {
    const cleaned = cleanMatchDisplayValue(value);
    if (cleaned) return cleaned;
  }
  return "";
}

function repairMatchColumns(question: StudyBuddyQuestion): StudyBuddyQuestion {
  if (canonicalQuestionType(question.type) !== "MATCH_COLUMNS") return question;
  const cleanSide = (side: unknown) => Array.isArray(side)
    ? side.map((item: any, index: number) => {
        const id = cleanMatchDisplayValue(item?.id);
        const text = extractHumanMatchValue(item);
        return { id: id && !isGeneratedMatchId(id) ? id : String(index + 1), text };
      }).filter((item: any) => item.text)
    : [];
  let columnA = cleanSide(question.columnA);
  let columnB = cleanSide(question.columnB);
  if ((!columnA.length || !columnB.length) && question.sourceOriginalText) {
    const parsed = parseMatchColumns(String(question.sourceOriginalText), question.sourceLines);
    if (parsed) {
      columnA = parsed.columnA.map(text => ({ text }));
      columnB = parsed.columnB.map(text => ({ text }));
    }
  }
  const questionText = cleanMatchDisplayValue(question.question);
  return {
    ...question,
    question: questionText.replace(/(?:column\s+a|column\s+b)[\s\S]*$/i, "").trim() || "Match the following",
    columnA,
    columnB,
  };
}

export function repairQuestionStructure(question: StudyBuddyQuestion): StudyBuddyQuestion {
  const canonical = canonicalQuestionType(question.type);
  const repaired = repairMatchColumns({ ...question, type: canonical });
  // Preserve old stored questions while normalizing harmless layout whitespace.
  if (typeof repaired.question === "string") repaired.question = repaired.question.replace(/\s+/g, " ").trim();
  return repaired;
}

function scoreCandidate(question: StudyBuddyQuestion, worksheet: StudyBuddyWorksheet, doubts: StudyBuddyDoubtSignal[], uploadedText: string) {
  const questionText = questionSearchText(question), coreText = questionCoreText(question), chapterText = worksheet.chapterName || worksheet.payload.chapter || "";
  let score = 0; const matchedDoubts: string[] = [];
  for (const doubt of doubts) {
    const topic = clean(doubt.topic), concept = clean(doubt.concept);
    const topicLabels = Array.from(new Set([topic, ...aliasLabels(topic)].map(clean).filter(Boolean)));
    const conceptLabels = Array.from(new Set([concept, ...aliasLabels(concept)].map(clean).filter(Boolean)));
    const scoreLabels = (labels: string[]) => labels.reduce((best, label) => Math.max(best, directCorePhraseScore(question, label), phraseBonus(coreText, label), overlapScore(coreText, label)), 0);
    const topicScore = topic ? scoreLabels(topicLabels) : 0;
    const conceptScore = concept ? scoreLabels(conceptLabels) : 0;
    // A concrete concept is authoritative. The parent topic is used for coverage
    // reporting/context, never as a substitute for an unrelated concept question.
    const best = concept ? conceptScore : topicScore;
    const strong = best >= 4;
    if (!strong) continue;
    let adjusted = best;
    if (overlapScore(chapterText, topic) > 0) adjusted += 2;
    const sourceContext = clean((question as any).sourceContext || (question as any).sourceFileName || "");
    if (sourceContext) adjusted += Math.min(sourceContextScore(sourceContext, doubt), 8);
    score += adjusted * Math.max(1, Number(doubt.signals ?? 1));
    if (topic) matchedDoubts.push(topic);
    if (concept) matchedDoubts.push(concept);
  }
  // Uploaded-text overlap is only a secondary tie-breaker and never creates a candidate.
  score += uploadedTextScore(questionText, uploadedText);
  return { score, matchedDoubts: Array.from(new Set(matchedDoubts.filter(Boolean))) };
}

function questionKey(candidate: Candidate) { return `${candidate.sourceKey}::${candidate.question.id}::${normalizeStudyBuddyText(candidate.question.question)}`; }

export function buildStudyBuddyPaper(worksheets: StudyBuddyWorksheet[], doubts: StudyBuddyDoubtSignal[], uploadedText = "", maxQuestions = 24, attachmentSources: StudyBuddyAttachmentSource[] = []): MatchResult {
  const candidates: Candidate[] = [];
  const doubtLabels = buildDoubtLabels(doubts);
  const sources = [...worksheets, ...attachmentSources.filter(s => s.text.trim() || Boolean(s.questionBlocks?.length)).map(parseAttachmentQuestions)];
  for (const worksheet of sources) {
    for (const rawQuestion of Array.isArray(worksheet.payload?.questions) ? worksheet.payload.questions : []) {
      const question: StudyBuddyQuestion = repairQuestionStructure({ ...rawQuestion, type: canonicalQuestionType(rawQuestion.type) });
      const valid = clean(question.id) && (clean(question.question) || ["UNSEEN_PASSAGE","READING_COMPREHENSION","IMAGE_BASED","CASE_BASED","SOURCE_BASED","DATA_INTERPRETATION"].includes(question.type));
      if (!valid) continue;
      const scored = scoreCandidate(question, worksheet, doubts, uploadedText);
      if (scored.score < 4 || !scored.matchedDoubts.length) continue;
      candidates.push({ question, worksheet, score: scored.score, matchedDoubts: scored.matchedDoubts, sourceKey: worksheet.id, typeKey: canonicalQuestionType(question.type) });
    }
  }
  candidates.sort((a,b) => b.score - a.score || b.matchedDoubts.length - a.matchedDoubts.length || new Date(b.worksheet.publishedAt).getTime() - new Date(a.worksheet.publishedAt).getTime() || a.question.id.localeCompare(b.question.id));

  const selected: Candidate[] = [], used = new Set<string>(), coveredDoubts = new Set<string>();
  const add = (candidate: Candidate) => {
    const key = questionKey(candidate);
    if (used.has(key) || selected.length >= maxQuestions) return false;
    used.add(key); selected.push(candidate);
    candidate.matchedDoubts.forEach(d => coveredDoubts.add(normalizeStudyBuddyText(d)));
    return true;
  };

  // Pass 1 — unresolved-doubt coverage is authoritative. For every current doubt,
  // choose the strongest distinct question that actually matches that signal.
  // This prevents format diversity from stealing slots from a real unresolved concept.
  for (const label of doubtLabels) {
    if (selected.length >= maxQuestions) break;
    const n = normalizeStudyBuddyText(label);
    const candidate = candidates.find(c => !used.has(questionKey(c)) && c.matchedDoubts.some(d => normalizeStudyBuddyText(d) === n));
    if (candidate) add(candidate);
  }

  // Pass 2 — preserve useful source-format diversity, but only after doubt coverage.
  const bestByType = new Map<string, Candidate>();
  for (const candidate of candidates) if (!bestByType.has(candidate.typeKey)) bestByType.set(candidate.typeKey, candidate);
  const typeOrder = ["MCQ","FILL_BLANK","TRUE_FALSE","MATCH_COLUMNS","ASSERTION_REASON","WORD_SORTING","IDENTIFY_UNDERLINE","ONE_WORD","VERY_SHORT_ANSWER","SHORT_ANSWER","LONG_ANSWER","CASE_BASED","SOURCE_BASED","DATA_INTERPRETATION","READING_COMPREHENSION","IMAGE_BASED","DIAGRAM_LABEL","ODD_ONE_OUT","REARRANGE","CORRECT_THE_SENTENCE","COMPLETE_TABLE","SEQUENCE_ORDER","GIVE_REASON","DIFFERENTIATE_COMPARE","GRAMMAR_TRANSFORMATION","OTHER"];
  for (const type of typeOrder) {
    if (selected.length >= maxQuestions) break;
    const candidate = bestByType.get(type);
    if (candidate && !used.has(questionKey(candidate))) add(candidate);
  }

  // Pass 3 — strongest remaining connected questions until the existing max is reached.
  for (const candidate of candidates) {
    if (selected.length >= maxQuestions) break;
    add(candidate);
  }

  const questions: MatchedStudyBuddyQuestion[] = selected.map(item => {
    const isAttachment = item.worksheet.teacherUuid === "student-attachment";
    const attachmentId = isAttachment ? item.worksheet.id.replace(/^attachment-source-/, "") : undefined;
    return { ...item.question, studyBuddySource: { sourceKind: isAttachment ? "attachment" : "worksheet", sourceId: isAttachment ? String(attachmentId ?? item.worksheet.id) : item.worksheet.id, worksheetId: isAttachment ? undefined : item.worksheet.id, attachmentId, worksheetTitle: item.worksheet.title, teacherName: item.worksheet.teacherName, chapterName: item.worksheet.chapterName, publishedAt: item.worksheet.publishedAt, matchedDoubts: item.matchedDoubts, score: Math.round(item.score * 10) / 10 } };
  });
  const matched = new Set<string>(); for (const q of questions) for (const d of q.studyBuddySource.matchedDoubts) matched.add(normalizeStudyBuddyText(d));
  return { questions, matchedDoubts: Array.from(matched), unmatchedDoubts: doubtLabels.filter(d => !matched.has(normalizeStudyBuddyText(d))), totalCandidates: candidates.length };
}
