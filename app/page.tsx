import { Suspense } from "react"
import InvestmentQuestionnaire from "@/components/investment-questionnaire"
import { Loader2 } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
            AI Портфельный Советник
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Получите персонализированные инвестиционные рекомендации на основе вашего профиля риска и финансовых целей
          </p>
        </header>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-2">Загрузка...</span>
            </div>
          }
        >
          <InvestmentQuestionnaire />
        </Suspense>
      </div>
    </main>
  )
}

