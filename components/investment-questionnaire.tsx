"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ResultsDisplay from "@/components/results-display"
import { useToast } from "@/hooks/use-toast"

const QUESTIONS = {
  risk_tolerance: {
    text: "Как бы вы оценили свою готовность к риску при инвестировании?",
    options: {
      A: "Я предпочитаю минимальный риск, даже если это ограничивает доходность",
      B: "Я готов(а) к умеренному риску ради стабильной доходности",
      C: "Я готов(а) к высокому риску ради возможности получить высокую доходность",
    },
  },
  capital_share: {
    text: "Какую часть ваших сбережений вы готовы вложить в инвестиции?",
    options: {
      A: "Не больше 10% — на случай непредвиденных обстоятельств",
      B: "От 10% до 30% — для умеренного роста сбережений",
      C: "Более 30% — я хочу максимально эффективно использовать капитал",
    },
  },
  volatility_tolerance: {
    text: "Как вы отнесетесь к временному снижению стоимости ваших инвестиций?",
    options: {
      A: "Я буду беспокоиться и, возможно, захочу продать активы",
      B: "Меня это слегка тревожит, но я готов(а) подождать восстановления",
      C: "Я понимаю, что это часть стратегии, и готов(а) ждать ради роста",
    },
  },
  financial_goals: {
    text: "Каковы ваши основные финансовые цели?",
    options: {
      A: "Сохранить капитал с минимальным риском",
      B: "Получить стабильный доход для увеличения финансовой подушки",
      C: "Увеличить капитал максимально, даже если это связано с риском",
    },
  },
  investment_horizon: {
    text: "Каков ваш инвестиционный горизонт?",
    options: {
      A: "Менее 3 лет — мне нужны деньги в ближайшем будущем",
      B: "От 3 до 10 лет — я настроен(а) на среднесрочные результаты",
      C: "Более 10 лет — у меня долгосрочные планы",
    },
  },
}

export default function InvestmentQuestionnaire() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const questionKeys = Object.keys(QUESTIONS)
  const currentQuestionKey = questionKeys[currentQuestionIndex]
  const currentQuestion = QUESTIONS[currentQuestionKey as keyof typeof QUESTIONS]
  const progress = ((currentQuestionIndex + 1) / questionKeys.length) * 100

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionKey]: value,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questionKeys.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // Имитация API запроса
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const isNextDisabled = !answers[currentQuestionKey]

  if (isSubmitted) {
    return <ResultsDisplay answers={answers} />
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-400">
            Вопрос {currentQuestionIndex + 1} из {questionKeys.length}
          </span>
          <span className="text-sm text-slate-400">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-700" />
      </div>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-400">{currentQuestion.text}</CardTitle>
          <CardDescription className="text-slate-400">
            Выберите один из вариантов, который лучше всего соответствует вашей ситуации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[currentQuestionKey]} onValueChange={handleAnswerChange} className="space-y-4">
            {Object.entries(currentQuestion.options).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <RadioGroupItem value={key} id={`option-${key}`} className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor={`option-${key}`} className="text-lg font-medium">
                    Вариант {key}
                  </Label>
                  <p className="text-sm text-slate-400">{value}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
          >
            {currentQuestionIndex === questionKeys.length - 1 ? (
              isLoading ? (
                "Обработка..."
              ) : (
                "Получить результаты"
              )
            ) : (
              <>
                Далее
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

