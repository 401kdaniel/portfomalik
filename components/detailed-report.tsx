"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface DetailedReportProps {
  report: string
}

export default function DetailedReport({ report }: DetailedReportProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    toast({
      title: "Скопировано в буфер обмена",
      description: "Текст отчета скопирован в буфер обмена",
      duration: 3000,
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "investment_report.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Отчет скачан",
      description: "Файл investment_report.txt сохранен на ваше устройство",
      duration: 3000,
    })
  }

  // Преобразование Markdown в HTML
  const formatReport = (text: string) => {
    // Заголовки
    let formatted = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-emerald-400">$1</h1>')
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3 text-emerald-300">$1</h2>')
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-emerald-200">$1</h3>')

    // Списки
    formatted = formatted.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
    formatted = formatted.replace(/<\/li>\n<li/g, "</li><li")
    formatted = formatted.replace(/<li(.*?)>(.*?)<\/li>/g, '<ul class="list-disc ml-6 my-3"><li$1>$2</li></ul>')
    formatted = formatted.replace(/<\/ul>\n<ul(.*?)>/g, "")

    // Параграфы
    formatted = formatted.replace(/^(?!<[uh]|$)(.*$)/gm, '<p class="mb-3 text-slate-300">$1</p>')

    // Пустые строки
    formatted = formatted.replace(/^\s*[\r\n]/gm, "")

    return formatted
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl text-emerald-400">Детальный отчет</CardTitle>
            <CardDescription className="text-slate-400">
              Подробный анализ вашего инвестиционного портфеля
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Скопировано" : "Копировать"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-900/50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
          <div dangerouslySetInnerHTML={{ __html: formatReport(report) }} />
        </div>
      </CardContent>
    </Card>
  )
}

