export function calculateCompetitionCredits(
  submissionsCount: number
) {
  return submissionsCount * 10;
}

export function calculateAchievementCredits(
  achievementsCount: number,
  verifiedCount: number
) {
  return (
    achievementsCount * 10 +
    verifiedCount * 10
  );
}

export function calculatePortfolioCredits(
  performanceCount: number,
  projectCount: number,
  skillCount: number
) {
  return (
    performanceCount * 10 +
    projectCount * 10 +
    skillCount * 10
  );
}

export function calculateLeaderboardBonus(
  globalRank?: number
) {
  if (globalRank === 1) return 50;
  if (globalRank === 2) return 30;
  if (globalRank === 3) return 20;

  return 0;
}