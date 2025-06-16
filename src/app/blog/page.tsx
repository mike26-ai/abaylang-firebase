
"use client"

// import type React from "react" // MVP: Defer blog
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Calendar, Clock, ExternalLink, BookOpen, User, MessageSquare } from "lucide-react"
// import Link from "next/link"
// import { NewsletterSignup } from "@/components/newsletter/newsletter-signup"
// import type { Metadata } from 'next';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learning Blog</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our blog is coming soon with insights, tips, and stories to help you master Amharic!
          </p>
        </div>
      </div>
    </div>
  )
}
