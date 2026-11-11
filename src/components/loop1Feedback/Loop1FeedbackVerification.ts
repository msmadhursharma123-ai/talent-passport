export function hasLoop1VerificationQuestion(log: any): boolean {
  const rawCorrectIndex = log?.cross_question_correct_index;
  const correctIndex = Number(rawCorrectIndex);

  return Boolean(
    log &&
      (log.cross_question_text || log.cross_question_image_path) &&
      Array.isArray(log.cross_question_options) &&
      log.cross_question_options.length === 4 &&
      log.cross_question_options.every(
        (option: unknown) => typeof option === "string" && option.trim().length > 0
      ) &&
      rawCorrectIndex !== null &&
      rawCorrectIndex !== undefined &&
      rawCorrectIndex !== "" &&
      Number.isInteger(correctIndex) &&
      correctIndex >= 0 &&
      correctIndex <= 3
  );
}
