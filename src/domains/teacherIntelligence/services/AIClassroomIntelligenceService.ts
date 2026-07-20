import type {
  ClassroomDoubtInput,
  ClassroomIntelligence,
  ConceptualGap,
} from "../types/ClassroomIntelligence";

export async function generateClassroomIntelligence(
  input: ClassroomDoubtInput
): Promise<ClassroomIntelligence> {

  const conceptFrequency = new Map<string, number>();

  for (const doubt of input.doubts) {

    const text = doubt.toLowerCase();

    if (
      text.includes("sign") ||
      text.includes("positive") ||
      text.includes("negative")
    ) {
      increaseCount(
        conceptFrequency,
        "Sign Convention Confusion"
      );
    }

    if (
      text.includes("magnification")
    ) {
      increaseCount(
        conceptFrequency,
        "Magnification Formula"
      );
    }

    if (
      text.includes("distance") ||
      text.includes("object") ||
      text.includes("image")
    ) {
      increaseCount(
        conceptFrequency,
        "Object and Image Distance"
      );
    }

    if (
      text.includes("formula")
    ) {
      increaseCount(
        conceptFrequency,
        "Formula Application"
      );
    }

    if (
      text.includes("numerical") ||
      text.includes("problem")
    ) {
      increaseCount(
        conceptFrequency,
        "Numerical Problem Solving"
      );
    }

    if (
      text.includes("diagram") ||
      text.includes("drawing")
    ) {
      increaseCount(
        conceptFrequency,
        "Diagram Understanding"
      );
    }

  }

  const commonConceptualGaps: ConceptualGap[] =
    Array.from(conceptFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([title, frequency]) => ({
        title,
        frequency,
        summary: getSummary(title),
      }));


  return {
    commonConceptualGaps,
  };

}


function increaseCount(
  map: Map<string, number>,
  key: string
) {

  const count = map.get(key) ?? 0;

  map.set(
    key,
    count + 1
  );

}


function getSummary(
  title: string
): string {

  switch (title) {

    case "Sign Convention Confusion":
      return "Students are struggling with positive and negative sign conventions.";

    case "Magnification Formula":
      return "Students are finding the magnification formula difficult to understand.";

    case "Object and Image Distance":
      return "Students are confused about object and image distance calculations.";

    case "Formula Application":
      return "Students are unable to apply classroom formulas in practice.";

    case "Numerical Problem Solving":
      return "Students are facing difficulty while solving numerical questions.";

    case "Diagram Understanding":
      return "Students require additional support in understanding diagrams and illustrations.";

    default:
      return "Students require additional conceptual clarity.";

  }

}