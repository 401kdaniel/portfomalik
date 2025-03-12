export function calculateRiskProfile(answers: Record<string, string>): "conservative" | "moderate" | "aggressive" {
  const answerValues = {
    A: 1,
    B: 2,
    C: 3,
  }

  let score = 0

  Object.values(answers).forEach((answer) => {
    score += answerValues[answer as keyof typeof answerValues]
  })

  if (score <= 7) {
    return "conservative"
  } else if (score <= 11) {
    return "moderate"
  } else {
    return "aggressive"
  }
}

