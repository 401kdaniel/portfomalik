"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, BarChart } from "lucide-react"

interface PortfolioAllocationProps {
  allocation: {
    stocks: number
    bonds: number
    cash: number
  }
}

export default function PortfolioAllocation({ allocation }: PortfolioAllocationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartType, setChartType] = useState<"pie" | "bar">("pie")

  const colors = {
    stocks: "#10b981", // emerald-500
    bonds: "#3b82f6", // blue-500
    cash: "#f59e0b", // amber-500
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (chartType === "pie") {
      drawPieChart(ctx, canvas.width, canvas.height)
    } else {
      drawBarChart(ctx, canvas.width, canvas.height)
    }
  }, [allocation, chartType])

  const drawPieChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 40

    const total = Object.values(allocation).reduce((sum, value) => sum + value, 0)
    let startAngle = -0.5 * Math.PI // Start at top

    // Draw pie slices
    Object.entries(allocation).forEach(([key, value], index) => {
      const sliceAngle = (value / total) * 2 * Math.PI
      const endAngle = startAngle + sliceAngle

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = colors[key as keyof typeof colors]
      ctx.fill()

      // Draw labels
      const labelAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + Math.cos(labelAngle) * labelRadius
      const labelY = centerY + Math.sin(labelAngle) * labelRadius

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${value}%`, labelX, labelY)

      startAngle = endAngle
    })

    // Draw legend
    const legendY = height - 30
    let legendX = 20

    Object.entries(allocation).forEach(([key, value]) => {
      const label = key.charAt(0).toUpperCase() + key.slice(1)

      ctx.fillStyle = colors[key as keyof typeof colors]
      ctx.fillRect(legendX, legendY, 15, 15)

      ctx.fillStyle = "#e2e8f0" // slate-200
      ctx.font = "14px Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(label, legendX + 20, legendY + 7)

      legendX += ctx.measureText(label).width + 50
    })
  }

  const drawBarChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const barWidth = 60
    const maxBarHeight = height - 80
    const startX = width / 2 - (Object.keys(allocation).length * barWidth) / 2

    // Draw bars
    Object.entries(allocation).forEach(([key, value], index) => {
      const barHeight = (value / 100) * maxBarHeight
      const barX = startX + index * barWidth
      const barY = height - 50 - barHeight

      ctx.fillStyle = colors[key as keyof typeof colors]
      ctx.fillRect(barX, barY, barWidth - 10, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(`${value}%`, barX + (barWidth - 10) / 2, barY - 5)

      // Draw label below bar
      const label = key.charAt(0).toUpperCase() + key.slice(1)
      ctx.fillStyle = "#e2e8f0" // slate-200
      ctx.font = "14px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.fillText(label, barX + (barWidth - 10) / 2, height - 30)
    })
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-emerald-400">Распределение активов</CardTitle>
            <CardDescription className="text-slate-400">
              Рекомендуемое распределение активов на основе вашего профиля риска
            </CardDescription>
          </div>
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as "pie" | "bar")} className="w-auto">
            <TabsList className="bg-slate-700/50">
              <TabsTrigger value="pie" className="data-[state=active]:bg-slate-600">
                <PieChart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="bar" className="data-[state=active]:bg-slate-600">
                <BarChart className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas ref={canvasRef} width={600} height={400} className="max-w-full" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {Object.entries(allocation).map(([key, value]) => (
            <div key={key} className="bg-slate-700/50 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400 mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="text-2xl font-bold" style={{ color: colors[key as keyof typeof colors] }}>
                {value}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

