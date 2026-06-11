export function calculatePercentile(
  currentScore: number,
  allScores: number[]
) {

  if (
    !allScores ||
    allScores.length === 0
  ) {
    return 50;
  }

  const below =
    allScores.filter(
      (score) =>
        score < currentScore
    ).length;

  return Math.round(
    (below /
      allScores.length) *
      100
  );
}