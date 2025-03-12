"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Percent, BarChart2, DollarSign, Activity } from "lucide-react"

interface Company {
  symbol: string
  name: string
  sector: string
  current_price: number
  beta: number
  dividend_yield: number
  price_change_5y: number
  historical_prices: number[]
}

interface CompanyRecommendationsProps {
  recommendations: Company[]
}

export default function CompanyRecommendations({ recommendations }: CompanyRecommendationsProps) {
  const [activeCompany, setActiveCompany] = useState(recommendations[0].symbol)

  const getCompanyById = (symbol: string) => {
    return recommendations.find((company) => company.symbol === symbol) || recommendations[0]
  }

  const selectedCompany = getCompanyById(activeCompany)

  const renderPriceChart = (company: Company) => {
    const canvasRef = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const prices = company.historical_prices
      const width = canvas.width
      const height = canvas.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Find min and max prices for scaling
      const minPrice = Math.min(...prices) * 0.95
      const maxPrice = Math.max(...prices) * 1.05
      const priceRange = maxPrice - minPrice

      // Draw axes
      ctx.strokeStyle = "#475569" // slate-600
      ctx.lineWidth = 1

      // X-axis
      ctx.beginPath()
      ctx.moveTo(40, height - 30)
      ctx.lineTo(width - 20, height - 30)
      ctx.stroke()

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(40, 20)
      ctx.lineTo(40, height - 30)
      ctx.stroke()

      // Draw price line
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = "#10b981" // emerald-500

      const pointWidth = (width - 60) / (prices.length - 1)

      prices.forEach((price, index) => {
        const x = 40 + index * pointWidth
        const y = height - 30 - ((price - minPrice) / priceRange) * (height - 50)

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Add gradient under the line
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)") // emerald-500 with opacity
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(40, height - 30)

      prices.forEach((price, index) => {
        const x = 40 + index * pointWidth
        const y = height - 30 - ((price - minPrice) / priceRange) * (height - 50)
        ctx.lineTo(x, y)
      })

      ctx.lineTo(40 + (prices.length - 1) * pointWidth, height - 30)
      ctx.closePath()
      ctx.fill()

      // Add price labels on Y-axis
      ctx.fillStyle = "#94a3b8" // slate-400
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"

      const numLabels = 5
      for (let i = 0; i <= numLabels; i++) {
        const price = minPrice + (i / numLabels) * priceRange
        const y = height - 30 - (i / numLabels) * (height - 50)
        ctx.fillText(`$${price.toFixed(2)}`, 35, y)
      }

      // Add time labels on X-axis
      ctx.textAlign = "center"
      ctx.textBaseline = "top"

      const timeLabels = ["5 лет назад", "4 года", "3 года", "2 года", "1 год", "Сейчас"]
      const labelStep = (prices.length - 1) / (timeLabels.length - 1)

      timeLabels.forEach((label, index) => {
        const x = 40 + index * labelStep * pointWidth
        ctx.fillText(label, x, height - 20)
      })
    }

    return (
      <div className="mt-4">
        <h4 className="text-lg font-medium mb-2">Динамика цены за 5 лет</h4>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <canvas ref={canvasRef} width={800} height={300} className="w-full" />
        </div>
      </div>
    )
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-emerald-400">Рекомендуемые компании</CardTitle>
        <CardDescription className="text-slate-400">
          Акции, подобранные в соответствии с вашим профилем риска
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCompany} onValueChange={setActiveCompany} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8 bg-slate-800/50">
            {recommendations.map((company) => (
              <TabsTrigger key={company.symbol} value={company.symbol} className="data-[state=active]:bg-slate-700">
                {company.name} ({company.symbol})
              </TabsTrigger>
            ))}
          </TabsList>

          {recommendations.map((company) => (
            <TabsContent key={company.symbol} value={company.symbol}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{company.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-slate-700 hover:bg-slate-600 mr-2">{company.symbol}</Badge>
                        <span className="text-slate-400">{company.sector}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">${company.current_price.toFixed(2)}</div>
                      <div
                        className={`flex items-center justify-end mt-1 ${
                          company.price_change_5y > 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {company.price_change_5y > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        <span>{company.price_change_5y.toFixed(2)}% за 5 лет</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center text-slate-400 mb-1">
                        <Activity className="h-4 w-4 mr-1" />
                        <span className="text-sm">Бета</span>
                      </div>
                      <div className="text-xl font-bold">{company.beta.toFixed(2)}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {company.beta < 0.8
                          ? "Низкая волатильность"
                          : company.beta < 1.2
                            ? "Средняя волатильность"
                            : "Высокая волатильность"}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center text-slate-400 mb-1">
                        <Percent className="h-4 w-4 mr-1" />
                        <span className="text-sm">Дивиденды</span>
                      </div>
                      <div className="text-xl font-bold">{company.dividend_yield.toFixed(2)}%</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {company.dividend_yield === 0
                          ? "Нет дивидендов"
                          : company.dividend_yield < 1
                            ? "Низкие дивиденды"
                            : company.dividend_yield < 3
                              ? "Средние дивиденды"
                              : "Высокие дивиденды"}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium mb-2">Анализ компании</h4>
                    <p className="text-slate-300">
                      {company.symbol === "JNJ" &&
                        "Johnson & Johnson - стабильная компания в секторе здравоохранения с долгой историей выплаты дивидендов. Низкий показатель бета указывает на меньшую волатильность по сравнению с рынком."}
                      {company.symbol === "PG" &&
                        "Procter & Gamble - компания, производящая потребительские товары первой необходимости, что обеспечивает стабильность в периоды экономической нестабильности."}
                      {company.symbol === "KO" &&
                        "Coca-Cola Company - один из крупнейших производителей безалкогольных напитков с глобальным присутствием. Компания известна своей стабильностью и регулярными дивидендными выплатами."}
                      {company.symbol === "AAPL" &&
                        "Apple Inc. - технологический гигант с сильным брендом и лояльной клиентской базой. Умеренный показатель бета и стабильный рост делают эту компанию привлекательной для инвесторов с умеренным профилем риска."}
                      {company.symbol === "MSFT" &&
                        "Microsoft Corporation - один из крупнейших разработчиков программного обеспечения с диверсифицированным бизнесом, включающим облачные сервисы, операционные системы и офисные приложения."}
                      {company.symbol === "JPM" &&
                        "JPMorgan Chase & Co. - один из крупнейших банков США с диверсифицированным бизнесом в сфере инвестиционного и коммерческого банкинга."}
                      {company.symbol === "NVDA" &&
                        "NVIDIA Corporation - лидер в области производства графических процессоров и технологий искусственного интеллекта. Высокий показатель бета и значительный рост цены акций за последние 5 лет отражают высокий потенциал роста и соответствующий риск."}
                      {company.symbol === "TSLA" &&
                        "Tesla, Inc. - инновационная компания в автомобильной отрасли, специализирующаяся на электромобилях и решениях для хранения энергии. Высокий показатель бета и отсутствие дивидендов указывают на высокий риск, но потенциально высокую доходность."}
                      {company.symbol === "AMD" &&
                        "Advanced Micro Devices, Inc. - компания, специализирующаяся на производстве полупроводников и процессоров. Высокий показатель бета и значительный рост цены акций за последние 5 лет отражают высокий потенциал роста и соответствующий риск."}
                    </p>
                  </div>
                </div>

                <div>
                  {renderPriceChart(company)}

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center text-slate-400 mb-1">
                        <BarChart2 className="h-4 w-4 mr-1" />
                        <span className="text-sm">Изменение за 5 лет</span>
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          company.price_change_5y > 0 ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {company.price_change_5y.toFixed(2)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {company.price_change_5y < 30
                          ? "Умеренный рост"
                          : company.price_change_5y < 100
                            ? "Хороший рост"
                            : "Исключительный рост"}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center text-slate-400 mb-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-sm">Текущая цена</span>
                      </div>
                      <div className="text-xl font-bold">${company.current_price.toFixed(2)}</div>
                      <div className="text-xs text-slate-400 mt-1">По состоянию на сегодня</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

