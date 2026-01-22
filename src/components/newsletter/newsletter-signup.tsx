
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Check } from "lucide-react"
import { Spinner } from "@/components/ui/spinner" // Added for loading state

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Simulate API call (e.g., to Mailchimp via a Server Action or API route)
    // Replace this with your actual newsletter subscription logic
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For a real implementation, you would handle success/error from the API
    setIsSubscribed(true)
    setIsLoading(false)
    // setEmail("") // Optionally clear email on success, or after the success message disappears

    // Reset success message after a few seconds
    setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
    }, 5000);
  }

  if (isSubscribed) {
    return (
      <Card className="bg-accent border-primary/30 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Check className="w-6 h-6" />
            <span className="font-semibold text-lg">Successfully subscribed!</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
<<<<<<< HEAD
            You'll receive our weekly Amharic learning tips and cultural insights.
=======
            You&apos;ll receive our weekly Amharic learning tips and cultural insights.
>>>>>>> before-product-selection-rewrite
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-accent/50 to-background border-border shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground text-lg">Weekly Amharic Tips</span>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Free</Badge>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Get weekly Amharic phrases, cultural insights, and learning tips delivered to your inbox.
        </p>

        <form onSubmit={handleSubscribe} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-background"
          />
          <Button type="submit" disabled={isLoading || !email} className="w-full">
            {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {isLoading ? "Subscribing..." : "Subscribe to Newsletter"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground/80 mt-3 text-center">
          No spam. Unsubscribe anytime.
          {/* Powered by Mailchimp - uncomment if you use Mailchimp */}
        </p>
      </CardContent>
    </Card>
  )
}
