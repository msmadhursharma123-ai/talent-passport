export function calculateReliability(
  answers: Record<number, any>
) {
  let score = 100;

  const q3 =
    answers[3] || [];

  const q6 =
    answers[6] || [];

  const stage =
    Number(answers[7] || 5);

  const friends =
    Number(answers[8] || 5);

  // Shy but high stage confidence

  if (
    q3.includes("Shy") &&
    stage >= 8
  ) {
    score -= 15;
  }

  // Confident but low social score

  if (
    q3.includes("Confident") &&
    friends <= 3
  ) {
    score -= 15;
  }

  // Leadership improvement needed
  // while already claiming leader

  if (
    q3.includes("Leader") &&
    q6.includes("Leadership")
  ) {
    score -= 10;
  }

  return Math.max(score, 40);
}