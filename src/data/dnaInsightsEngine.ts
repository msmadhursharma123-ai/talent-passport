export function getDNAConfidence(
  verifiedCount: number
) {

  if (verifiedCount >= 10)
    return "High";

  if (verifiedCount >= 5)
    return "Medium";

  return "Low";
}

export function getStrongestSkill(
  dna: any
) {

  return Object.keys(
    dna
  ).reduce(
    (a, b) =>
      dna[a] > dna[b]
        ? a
        : b
  );
}

export function getWeakestSkill(
  dna: any
) {

  return Object.keys(
    dna
  ).reduce(
    (a, b) =>
      dna[a] < dna[b]
        ? a
        : b
  );
}

export function getFutureReadinessScore(
  dna: any
) {

  const values =
    Object.values(
      dna
    ) as number[];

  const total =
    values.reduce(
      (sum, val) =>
        sum + val,
      0
    );

  return Math.round(
    total /
      values.length
  );
}