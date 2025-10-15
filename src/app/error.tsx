
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl">Something went wrong</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            An unexpected error occurred.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-8">
            We apologize for the inconvenience. Please try again, or contact support if the problem persists.
          </p>
          <Button onClick={() => reset()} size="lg">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
