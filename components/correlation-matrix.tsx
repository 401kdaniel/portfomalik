"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Company {
  symbol: string
  name: string
}

interface CorrelationMatrixProps {
  correlationMatrix: number[][]
  companies: Company[]
}

export default function CorrelationMatrix({ correlationMatrix, companies }: CorrelationMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !correlationMatrix || !companies) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cellSize = 80
    const headerSize = 120
    const totalSize = headerSize + cellSize * companies.length

    // Resize canvas if needed
    canvas.width = totalSize
    canvas.height = totalSize

    // Draw background
    ctx.fillStyle = "#1e293b" // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw headers
    ctx.fillStyle = "#e2e8f0" // slate-200
    ctx.font = "bold 14px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    companies.forEach((company, index) => {
      // Column headers
      ctx.save()
      ctx.translate(headerSize + index * cellSize + cellSize / 2, headerSize / 2)
      ctx.rotate(-Math.PI / 4)
      ctx.fillText(company.symbol, 0, 0)
      ctx.restore()

      // Row headers
      ctx.fillText(company.symbol, headerSize / 2, headerSize + index * cellSize + cellSize / 2)
    })

    // Draw correlation cells
    correlationMatrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const x = headerSize + colIndex * cellSize
        const y = headerSize + rowIndex * cellSize

        // Determine color based on correlation value
        let color
        if (rowIndex === colIndex) {
          color = "#10b981" // emerald-500 for diagonal (self-correlation)
        } else if (value >= 0.8) {
          color = "#ef4444" // red-500 for high positive correlation
        } else if (value >= 0.5) {
          color = "#f97316" // orange-500 for medium positive correlation
        } else if (value >= 0.2) {
          color = "#eab308" // yellow-500 for low positive correlation
        } else if (value >= -0.2) {
          color = "#94a3b8" // slate-400 for no correlation
        } else if (value >= -0.5) {
          color = "#3b82f6" // blue-500 for low negative correlation
        } else if (value >= -0.8) {
          color = "#6366f1" // indigo-500 for medium negative correlation
        } else {
          color = "#8b5cf6" // violet-500 for high negative correlation
        }

        // Draw cell background
        ctx.fillStyle = color
        ctx.fillRect(x, y, cellSize, cellSize)

        // Draw cell value
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 16px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(value.toFixed(2), x + cellSize / 2, y + cellSize / 2)
      })
    })

    // Draw grid lines
    ctx.strokeStyle = "#334155" // slate-700
    ctx.lineWidth = 1

    // Vertical lines
    for (let i = 0; i <= companies.length; i++) {
      ctx.beginPath()
      ctx.moveTo(headerSize + i * cellSize, headerSize)
      ctx.lineTo(headerSize + i * cellSize, headerSize + companies.length * cellSize)
      ctx.stroke()
    }

    // Horizontal lines
    for (let i = 0; i <= companies.length; i++) {
      ctx.beginPath()
      ctx.moveTo(headerSize, headerSize + i * cellSize)
      ctx.lineTo(headerSize + companies.length * cellSize, headerSize + i * cellSize)
      ctx.stroke()
    }

    // Draw header separator
    ctx.strokeStyle = "#475569" // slate-600
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(0, headerSize)
    ctx.lineTo(canvas.width, headerSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(headerSize, 0)
    ctx.lineTo(headerSize, canvas.height)
    ctx.stroke()
  }, [correlationMatrix, companies])

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-emerald-400">Матрица корреляции</CardTitle>
        <CardDescription className="text-slate-400">Анализ взаимосвязи между рекомендуемыми акциями</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <canvas ref={canvasRef} width={500} height={500} className="mx-auto" />
        </div>

        <div className="mt-6 bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">Интерпретация корреляции</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-slate-300 mb-2">Положительная корреляция</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span>0.8 - 1.0: Сильная положительная</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                  <span>0.5 - 0.8: Средняя положительная</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span>0.2 - 0.5: Слабая положительная</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-slate-300 mb-2">Отрицательная корреляция</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-violet-500 mr-2"></div>
                  <span>-0.8 - -1.0: Сильная отрицательная</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
                  <span>-0.5 - -0.8: Средняя отрицательная</span>
                </li>
                <li className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span>-0.2 - -0.5: Слабая отрицательная</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="text-sm font-medium text-slate-300 mb-2">Нейтральная корреляция</h5>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-slate-400 mr-2"></div>
              <span className="text-sm">-0.2 - 0.2: Нет значимой корреляции</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-700/50 rounded-lg p-4">
          <h4 className="text-lg font-medium mb-2">Что это значит для вашего портфеля</h4>
          <p className="text-slate-300 text-sm">
            Корреляция показывает, насколько тесно связаны изменения цен различных акций. Низкая корреляция между
            акциями в вашем портфеле означает лучшую диверсификацию и потенциально более низкий общий риск. Если одна
            акция падает в цене, другие могут не следовать за ней.
          </p>
          <p className="text-slate-300 text-sm mt-2">
            В идеальном портфеле присутствуют активы с низкой или отрицательной корреляцией, что помогает снизить
            волатильность портфеля в целом.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

