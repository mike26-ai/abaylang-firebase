"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink, BookOpen } from "lucide-react" // Added BookOpen for consistency
import Link from "next/link"
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup" // Import the component

export default function NewsPage() {
  const newsItems = [
    {
      id: "1",
      title: "New Cultural Immersion Package Now Available",
      excerpt:
        "Introducing our comprehensive 3-month cultural immersion program designed specifically for diaspora learners.",
      content:
        "We're excited to announce our new Cultural Immersion Package, a 12-week program that combines language learning with deep cultural exploration. This package includes weekly 90-minute sessions, cultural materials, traditional story sessions, and virtual cultural events.",
      date: "2024-01-10",
      category: "Product Update",
      featured: true,
    },
    {
      id: "2",
      title: "LissanHub Reaches 500+ Students Worldwide",
      excerpt:
        "Celebrating a major milestone as our community of Amharic learners continues to grow across 20+ countries.",
      content:
        "We're thrilled to share that LissanHub has now helped over 500 students reconnect with their Ethiopian heritage through Amharic language learning. Our students span across North America, Europe, Australia, and beyond.",
      date: "2024-01-05",
      category: "Milestone",
      featured: false,
    },
    {
      id: "3",
      title: "Group Sessions Launch This February",
      excerpt: "Join fellow learners in our new group sessions designed for intermediate and advanced students.",
      content:
        "Starting February 2024, we're launching group sessions for students who want to practice with peers. These sessions will focus on conversation practice, cultural discussions, and collaborative learning experiences.",
      date: "2024-01-03",
      category: "New Feature",
      featured: false,
    },
    {
      id: "4",
      title: "Holiday Schedule Update",
      excerpt: "Important updates to lesson scheduling during Ethiopian holidays and celebrations.",
      content:
        "Please note our adjusted schedule during Timkat (Ethiopian Epiphany) and other important Ethiopian holidays. We'll be offering special cultural sessions during these periods to help students understand the significance of these celebrations.",
      date: "2023-12-28",
      category: "Schedule",
      featured: false,
    },
    {
      id: "5",
      title: "Student Spotlight: Sara's Journey to Fluency",
      excerpt: "Follow Sara Mohammed's inspiring 6-month journey from complete beginner to conversational fluency.",
      content:
        "Read about Sara's incredible transformation from knowing zero Amharic to having meaningful conversations with her grandmother in Addis Ababa. Her story showcases the power of consistent practice and cultural connection.",
      date: "2023-12-20",
      category: "Student Story",
      featured: false,
    },
  ]

  const featuredNews = newsItems.filter((item) => item.featured)
  const regularNews = newsItems.filter((item) => !item.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background"> {/* Adapted gradient */}
      {/* Header is removed, global Navbar will be used */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">News & Updates</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest news, announcements, and developments from LissanHub
          </p>
        </div>

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured</h2>
            {featuredNews.map((item) => (
              <Card key={item.id} className="shadow-xl mb-6 bg-gradient-to-r from-accent/30 to-background border-border"> {/* Adapted gradient and card styling */}
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      {item.category}
                    </Badge>
                    <Button variant="outline" className="border-primary/30 hover:bg-accent">
                      Read More <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Regular News */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Updates</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {regularNews.map((item) => (
              <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground"> {/* Adapted badge */}
                      {item.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground">{item.title}</CardTitle> {/* Ensure CardTitle is used for h3 equivalent */}
                  <CardDescription className="leading-relaxed text-muted-foreground">{item.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full border-primary/30 hover:bg-accent">
                    Read Full Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12">
            <NewsletterSignup />
        </div>
      </div>
    </div>
  )
}
