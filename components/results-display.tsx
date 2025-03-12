"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, RefreshCw, PieChart, BarChart3, FileText, AlertTriangle } from "lucide-react"
import PortfolioAllocation from "@/components/portfolio-allocation"
import CompanyRecommendations from "@/components/company-recommendations"
import CorrelationMatrix from "@/components/correlation-matrix"
import DetailedReport from "@/components/detailed-report"
import { calculateRiskProfile } from "@/lib/portfolio-utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResultsDisplayProps {
  answers: Record<string, string>
}

export default function ResultsDisplay({ answers }: ResultsDisplayProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("allocation")
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setIsLoading(true)
      setError(null)
      setUsingMockData(false)

      try {
        console.log("Отправка запроса к API портфеля")
        // Вызываем API для получения данных портфеля
        const portfolioResponse = await fetch("/api/portfolio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        })

        console.log("Получен ответ от API портфеля:", portfolioResponse.status)

        if (!portfolioResponse.ok) {
          const errorData = await portfolioResponse.json().catch(() => ({}))
          const errorMessage = errorData.error || `Ошибка сервера: ${portfolioResponse.status}`
          throw new Error(errorMessage)
        }

        const portfolioResult = await portfolioResponse.json()

        if (!portfolioResult.success) {
          throw new Error(portfolioResult.error || "Неизвестная ошибка")
        }

        const portfolioData = portfolioResult.data

        console.log("Отправка запроса к API отчета")
        // Вызываем API для генерации отчета
        const reportResponse = await fetch("/api/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ portfolioData }),
        })

        console.log("Получен ответ от API отчета:", reportResponse.status)

        if (!reportResponse.ok) {
          const errorData = await reportResponse.json().catch(() => ({}))
          console.warn("Ошибка при генерации отчета, используем базовый отчет")
          // Продолжаем с данными портфеля, но без отчета
          portfolioData.detailed_report = `
            # Анализ инвестиционного портфеля
            
            Не удалось сгенерировать детальный отчет. Пожалуйста, проверьте настройки API или попробуйте позже.
          `
        } else {
          const reportResult = await reportResponse.json()

          if (reportResult.success) {
            portfolioData.detailed_report = reportResult.report
          } else {
            console.warn("Ошибка при генерации отчета:", reportResult.error)
            portfolioData.detailed_report = `
              # Анализ инвестиционного портфеля
              
              Не удалось сгенерировать детальный отчет. Пожалуйста, проверьте настройки API или попробуйте позже.
            `
          }
        }

        setPortfolioData(portfolioData)
      } catch (error) {
        console.error("Ошибка при получении данных:", error)
        setError(error instanceof Error ? error.message : "Неизвестная ошибка")

        toast({
          title: "Ошибка",
          description: `Произошла ошибка при получении данных: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
          variant: "destructive",
          duration: 5000,
        })

        // Используем моковые данные в случае ошибки
        setUsingMockData(true)
        const riskProfile = calculateRiskProfile(answers)

        const mockData = {
          risk_profile: riskProfile,
          allocation:
            riskProfile === "conservative"
              ? { stocks: 30, bonds: 50, cash: 20 }
              : riskProfile === "moderate"
                ? { stocks: 60, bonds: 30, cash: 10 }
                : { stocks: 80, bonds: 15, cash: 5 },
          recommendations: [
            {
              symbol: riskProfile === "conservative" ? "JNJ" : riskProfile === "moderate" ? "AAPL" : "NVDA",
              name:
                riskProfile === "conservative"
                  ? "Johnson & Johnson"
                  : riskProfile === "moderate"
                    ? "Apple Inc."
                    : "NVIDIA Corporation",
              sector:
                riskProfile === "conservative"
                  ? "Здравоохранение"
                  : riskProfile === "moderate"
                    ? "Технологии"
                    : "Полупроводники",
              current_price: riskProfile === "conservative" ? 152.5 : riskProfile === "moderate" ? 178.72 : 950.02,
              beta: riskProfile === "conservative" ? 0.55 : riskProfile === "moderate" ? 1.2 : 1.8,
              dividend_yield: riskProfile === "conservative" ? 2.8 : riskProfile === "moderate" ? 0.5 : 0.05,
              price_change_5y: riskProfile === "conservative" ? 25.4 : riskProfile === "moderate" ? 185.3 : 450.7,
              historical_prices: Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 10) * 20 + i / 2),
            },
            {
              symbol: riskProfile === "conservative" ? "PG" : riskProfile === "moderate" ? "MSFT" : "TSLA",
              name:
                riskProfile === "conservative"
                  ? "Procter & Gamble"
                  : riskProfile === "moderate"
                    ? "Microsoft Corporation"
                    : "Tesla, Inc.",
              sector:
                riskProfile === "conservative"
                  ? "Потребительские товары"
                  : riskProfile === "moderate"
                    ? "Технологии"
                    : "Автомобили",
              current_price: riskProfile === "conservative" ? 145.2 : riskProfile === "moderate" ? 420.45 : 180.83,
              beta: riskProfile === "conservative" ? 0.4 : riskProfile === "moderate" ? 0.95 : 2.1,
              dividend_yield: riskProfile === "conservative" ? 2.4 : riskProfile === "moderate" ? 0.7 : 0,
              price_change_5y: riskProfile === "conservative" ? 42.8 : riskProfile === "moderate" ? 210.5 : 380.2,
              historical_prices: Array.from({ length: 60 }, (_, i) => 100 + Math.cos(i / 8) * 15 + i / 3),
            },
            {
              symbol: riskProfile === "conservative" ? "KO" : riskProfile === "moderate" ? "JPM" : "AMD",
              name:
                riskProfile === "conservative"
                  ? "Coca-Cola Company"
                  : riskProfile === "moderate"
                    ? "JPMorgan Chase & Co."
                    : "Advanced Micro Devices, Inc.",
              sector:
                riskProfile === "conservative" ? "Напитки" : riskProfile === "moderate" ? "Финансы" : "Полупроводники",
              current_price: riskProfile === "conservative" ? 60.8 : riskProfile === "moderate" ? 195.24 : 170.5,
              beta: riskProfile === "conservative" ? 0.65 : riskProfile === "moderate" ? 1.1 : 1.75,
              dividend_yield: riskProfile === "conservative" ? 2.9 : riskProfile === "moderate" ? 2.2 : 0,
              price_change_5y: riskProfile === "conservative" ? 35.6 : riskProfile === "moderate" ? 95.4 : 520.3,
              historical_prices: Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 12 + 2) * 18 + i / 4),
            },
          ],
          correlation_matrix: [
            [1.0, 0.45, 0.32],
            [0.45, 1.0, 0.58],
            [0.32, 0.58, 1.0],
          ],
          detailed_report: `
            # Анализ инвестиционного портфеля

            ## Введение
            
            Данный инвестиционный портфель разработан с учетом вашего ${
              riskProfile === "conservative"
                ? "консервативного"
                : riskProfile === "moderate"
                  ? "умеренного"
                  : "агрессивного"
            } профиля риска. Основная цель портфеля - ${
              riskProfile === "conservative"
                ? "сохранение капитала с минимальным риском"
                : riskProfile === "moderate"
                  ? "обеспечение стабильного роста при умеренном риске"
                  : "максимизация доходности при высоком риске"
            }.
            
            ## Обзор распределения активов
            
            Распределение активов в вашем портфеле:
            - Акции: ${riskProfile === "conservative" ? "30%" : riskProfile === "moderate" ? "60%" : "80%"}
            - Облигации: ${riskProfile === "conservative" ? "50%" : riskProfile === "moderate" ? "30%" : "15%"}
            - Наличные: ${riskProfile === "conservative" ? "20%" : riskProfile === "moderate" ? "10%" : "5%"}
            
            Такое распределение активов соответствует вашему профилю риска и обеспечивает ${
              riskProfile === "conservative"
                ? "высокую степень защиты капитала"
                : riskProfile === "moderate"
                  ? "баланс между ростом и защитой капитала"
                  : "максимальные возможности для роста"
            }.
            
            ## Анализ рекомендуемых компаний
            
            ### ${riskProfile === "conservative" ? "Johnson & Johnson (JNJ)" : riskProfile === "moderate" ? "Apple Inc. (AAPL)" : "NVIDIA Corporation (NVDA)"}
            
            ${
              riskProfile === "conservative"
                ? "Johnson & Johnson - стабильная компания в секторе здравоохранения с долгой историей выплаты дивидендов. Низкий показатель бета (0.55) указывает на меньшую волатильность по сравнению с рынком."
                : riskProfile === "moderate"
                  ? "Apple Inc. - технологический гигант с сильным брендом и лояльной клиентской базой. Умеренный показатель бета (1.2) и стабильный рост делают эту компанию привлекательной для инвесторов с умеренным профилем риска."
                  : "NVIDIA Corporation - лидер в области производства графических процессоров и технологий искусственного интеллекта. Высокий показатель бета (1.8) и значительный рост цены акций за последние 5 лет (450.7%) отражают высокий потенциал роста и соответствующий риск."
            }
            
            ### ${riskProfile === "conservative" ? "Procter & Gamble (PG)" : riskProfile === "moderate" ? "Microsoft Corporation (MSFT)" : "Tesla, Inc. (TSLA)"}
            
            ${
              riskProfile === "conservative"
                ? "Procter & Gamble - компания, производящая потребительские товары первой необходимости, что обеспечивает стабильность в периоды экономической нестабильности. Низкий показатель бета (0.40) и стабильные дивиденды делают эту компанию идеальной для консервативных инвесторов."
                : riskProfile === "moderate"
                  ? "Microsoft Corporation - один из крупнейших разработчиков программного обеспечения с диверсифицированным бизнесом, включающим облачные сервисы, операционные системы и офисные приложения. Показатель бета близкий к рынку (0.95) и стабильный рост делают эту компанию хорошим выбором для умеренного портфеля."
                  : "Tesla, Inc. - инновационная компания в автомобильной отрасли, специализирующаяся на электромобилях и решениях для хранения энергии. Высокий показатель бета (2.1) и отсутствие дивидендов указывают на высокий риск, но потенциально высокую доходность."
            }
            
            ### ${riskProfile === "conservative" ? "Coca-Cola Company (KO)" : riskProfile === "moderate" ? "JPMorgan Chase & Co. (JPM)" : "Advanced Micro Devices, Inc. (AMD)"}
            
            ${
              riskProfile === "conservative"
                ? "Coca-Cola Company - один из крупнейших производителей безалкогольных напитков с глобальным присутствием. Компания известна своей стабильностью и регулярными дивидендными выплатами, что делает ее привлекательной для консервативных инвесторов."
                : riskProfile === "moderate"
                  ? "JPMorgan Chase & Co. - один из крупнейших банков США с диверсифицированным бизнесом в сфере инвестиционного и коммерческого банкинга. Умеренный показатель бета (1.1) и привлекательная дивидендная доходность (2.2%) делают эту компанию хорошим выбором для умеренного портфеля."
                  : "Advanced Micro Devices, Inc. - компания, специализирующаяся на производстве полупроводников и процессоров. Высокий показатель бета (1.75) и значительный рост цены акций за последние 5 лет (520.3%) отражают высокий потенциал роста и соответствующий риск."
            }
            
            ## Корреляция между акциями
            
            Матрица корреляции показывает умеренную взаимосвязь между выбранными акциями, что обеспечивает хорошую диверсификацию портфеля и снижает общий риск.
            
            ## Риски и возможности
            
            ### Риски:
            ${
              riskProfile === "conservative"
                ? "- Инфляционный риск: консервативные портфели могут не обеспечивать достаточную защиту от инфляции\n- Риск упущенной выгоды: при росте рынка ваш портфель может показывать более скромные результаты"
                : riskProfile === "moderate"
                  ? "- Рыночный риск: умеренный портфель подвержен колебаниям рынка\n- Секторный риск: значительная доля технологических компаний может привести к волатильности при проблемах в этом секторе"
                  : "- Высокий рыночный риск: агрессивный портфель сильно подвержен колебаниям рынка\n- Риск концентрации: высокая доля технологических и инновационных компаний может привести к значительным потерям при проблемах в этих секторах"
            }
            
            ### Возможности:
            ${
              riskProfile === "conservative"
                ? "- Стабильный доход: регулярные дивидендные выплаты\n- Защита капитала: низкая волатильность в периоды рыночных спадов"
                : riskProfile === "moderate"
                  ? "- Сбалансированный рост: потенциал для долгосрочного роста при умеренном риске\n- Диверсификация: хорошо сбалансированный портфель с различными классами активов"
                  : "- Высокий потенциал роста: возможность значительного увеличения капитала\n- Инновационные компании: инвестиции в компании, определяющие будущее технологий и экономики"
            }
            
            ## Заключение
            
            Данный инвестиционный портфель соответствует вашему ${
              riskProfile === "conservative"
                ? "консервативному"
                : riskProfile === "moderate"
                  ? "умеренному"
                  : "агрессивному"
            } профилю риска и предоставляет ${
              riskProfile === "conservative"
                ? "стабильность и защиту капитала"
                : riskProfile === "moderate"
                  ? "баланс между ростом и защитой капитала"
                  : "максимальные возможности для роста при соответствующем уровне риска"
            }. Рекомендуется регулярно пересматривать и ребалансировать портфель для поддержания оптимального распределения активов.
          `,
        }

        setPortfolioData(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolioData()
  }, [answers, toast])

  const handleDownloadReport = () => {
    // Имитация скачивания отчета
    alert("Скачивание отчета...")
  }

  const handleRestart = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Анализируем ваш профиль</h3>
        <p className="text-slate-400 text-center max-w-md">
          Мы обрабатываем ваши ответы и формируем персонализированные инвестиционные рекомендации...
        </p>
      </div>
    )
  }

  const riskProfileLabels = {
    conservative: "Консервативный",
    moderate: "Умеренный",
    aggressive: "Агрессивный",
  }

  return (
    <div className="space-y-8">
      {usingMockData && (
        <Alert variant="warning" className="bg-amber-900/20 border-amber-700">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Используются демонстрационные данные</AlertTitle>
          <AlertDescription className="text-amber-300">
            Не удалось получить данные из API. Отображаются демонстрационные данные. Проверьте настройки API и
            попробуйте снова.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Ваш инвестиционный профиль</h2>
          <div className="flex items-center">
            <Badge
              className={`text-sm px-3 py-1 ${
                portfolioData.risk_profile === "conservative"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : portfolioData.risk_profile === "moderate"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {riskProfileLabels[portfolioData.risk_profile as keyof typeof riskProfileLabels]}
            </Badge>
            <span className="ml-3 text-slate-400">
              {portfolioData.risk_profile === "conservative"
                ? "Низкий риск, стабильность"
                : portfolioData.risk_profile === "moderate"
                  ? "Средний риск, сбалансированный рост"
                  : "Высокий риск, максимальный рост"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Скачать отчет
          </Button>
          <Button
            variant="outline"
            onClick={handleRestart}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Начать заново
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 bg-slate-800/50">
          <TabsTrigger value="allocation" className="data-[state=active]:bg-slate-700">
            <PieChart className="h-4 w-4 mr-2" />
            Распределение
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="data-[state=active]:bg-slate-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Рекомендации
          </TabsTrigger>
          <TabsTrigger value="correlation" className="data-[state=active]:bg-slate-700">
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="7" cy="17" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="17" cy="7" r="1" fill="currentColor" />
            </svg>
            Корреляция
          </TabsTrigger>
          <TabsTrigger value="report" className="data-[state=active]:bg-slate-700">
            <FileText className="h-4 w-4 mr-2" />
            Отчет
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allocation">
          <PortfolioAllocation allocation={portfolioData.allocation} />
        </TabsContent>

        <TabsContent value="recommendations">
          <CompanyRecommendations recommendations={portfolioData.recommendations} />
        </TabsContent>

        <TabsContent value="correlation">
          <CorrelationMatrix
            correlationMatrix={portfolioData.correlation_matrix}
            companies={portfolioData.recommendations.map((company: any) => ({
              symbol: company.symbol,
              name: company.name,
            }))}
          />
        </TabsContent>

        <TabsContent value="report">
          <DetailedReport report={portfolioData.detailed_report} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

