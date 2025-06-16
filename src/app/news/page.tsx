
"use client"

// import type React from "react" // MVP: Defer news
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Calendar, Clock, ExternalLink, BookOpen } from "lucide-react"
// import Link from "next/link"
// import { NewsletterSignup } from "@/components/newsletter/newsletter-signup"

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">News & Updates</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay tuned for the latest news, announcements, and developments from LissanHub. Coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
