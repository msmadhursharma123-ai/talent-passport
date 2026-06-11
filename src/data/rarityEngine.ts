export function calculateRarity(
  score: number
) {
  if (score >= 90)
    return {
      percentile: 95,
      label: "Exceptional"
    };

  if (score >= 80)
    return {
      percentile: 85,
      label: "Advanced"
    };

  if (score >= 70)
    return {
      percentile: 70,
      label: "Strong"
    };

  if (score >= 60)
    return {
      percentile: 55,
      label: "Average+"
    };

  if (score >= 50)
    return {
      percentile: 40,
      label: "Average"
    };

  return {
    percentile: 20,
    label: "Developing"
  };
}