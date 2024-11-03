"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<{
    companyName: string
    currentPrice: number
    recommendation: "Buy" | "Hold" | "Sell"
    summary: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      // Simulating API call and ChatGPT processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock response
      setAnalysis({
        companyName: "Apple Inc.",
        currentPrice: 150.25,
        recommendation: "Buy",
        summary: "Based on strong financial performance, innovative product pipeline, and market position, Apple Inc. appears to be a solid investment opportunity. The company's consistent revenue growth, high profit margins, and loyal customer base contribute to its positive outlook.",
      })
    } catch (err) {
      setError("Failed to fetch stock data or generate analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationIcon = (recommendation: "Buy" | "Hold" | "Sell") => {
    switch (recommendation) {
      case "Buy":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />
      case "Sell":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />
      case "Hold":
        return <ArrowRightIcon className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stock Analysis</CardTitle>
        <CardDescription>Enter a stock symbol to get AI-powered analysis and recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading || !symbol}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{analysis.companyName}</h3>
              <Badge variant="outline" className="text-lg font-semibold">
                ${analysis.currentPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Recommendation:</span>
              <Badge
                variant={
                  analysis.recommendation === "Buy"
                    ? "default"
                    : analysis.recommendation === "Sell"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm"
              >
                {getRecommendationIcon(analysis.recommendation)}
                <span className="ml-1">{analysis.recommendation}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Powered by Yahoo Finance data and ChatGPT analysis
      </CardFooter>
    </Card>
  )
}