"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink, BookOpen, User, MessageSquare } from "lucide-react" // Added User, MessageSquare for post meta
import Link from "next/link"
import { NewsletterSignup } from "@/components/newsletter/newsletter-signup" // Ensure this is imported
import type { Metadata } from 'next'; // Added for metadata

// export const metadata: Metadata = { // Metadata should be defined outside the component for Server Components, but this is a client component. For client components, use document.title or a Head component if needed.
//   title: 'Learning Blog - LissanHub',
//   description: 'Insights, tips, and stories to help you master Amharic and connect with Ethiopian culture.',
// };


// Note: For a client component, dynamic metadata would typically be set using `document.title` in a useEffect hook,
// or by wrapping the return in a <Head> component from `next/head` (though less common in App Router for static titles).
// For simplicity, we'll rely on a global title strategy or page-specific titles if this were a server component.


export default function BlogPage() {
  const blogPosts = [
    {
      id: "1",
      title: "5 Essential Amharic Phrases Every Diaspora Should Know",
      excerpt:
        "Start your Amharic journey with these fundamental phrases that will help you connect with family and community.",
      content:
        "Learning Amharic as a diaspora Ethiopian can feel overwhelming, but starting with these essential phrases will give you confidence in family gatherings and community events...",
      author: "Mahir Abas Mustefa",
      date: "2024-01-12",
      category: "Language Tips",
      readTime: "5 min read",
      featured: true,
      tags: ["Beginner", "Phrases", "Family"],
    },
    {
      id: "2",
      title: "Understanding Ethiopian Cultural Context in Language Learning",
      excerpt: "Why cultural immersion is crucial for mastering Amharic and connecting with your heritage.",
      content:
        "Language and culture are inseparable. When learning Amharic, understanding the cultural context behind words and phrases makes all the difference...",
      author: "Mahir Abas Mustefa",
      date: "2024-01-08",
      category: "Culture",
      readTime: "8 min read",
      featured: false,
      tags: ["Culture", "Heritage", "Context"],
    },
    {
      id: "3",
      title: "Mastering the Fidel Script: A Step-by-Step Guide",
      excerpt: "Learn the beautiful Ethiopian script with practical exercises and memory techniques.",
      content:
        "The Fidel script is one ofthe most beautiful writing systems in the world. Here's how to approach learning it systematically...",
      author: "Mahir Abas Mustefa",
      date: "2024-01-05",
      category: "Writing System",
      readTime: "12 min read",
      featured: false,
      tags: ["Fidel", "Writing", "Script"],
    },
    {
      id: "4",
      title: "Common Mistakes Diaspora Learners Make (And How to Avoid Them)",
      excerpt: "Learn from the most frequent errors and accelerate your Amharic learning journey.",
      content:
        "After teaching hundreds of diaspora students, I've noticed common patterns in mistakes. Here's how to avoid them...",
      author: "Mahir Abas Mustefa",
      date: "2024-01-02",
      category: "Learning Tips",
      readTime: "7 min read",
      featured: false,
      tags: ["Mistakes", "Tips", "Learning"],
    },
    {
      id: "5",
      title: "Preparing for Your First Trip to Ethiopia: Language Edition",
      excerpt: "Essential Amharic phrases and cultural knowledge for your homeland visit.",
      content:
        "Planning your first trip to Ethiopia? Here's the language preparation that will make your experience unforgettable...",
      author: "Mahir Abas Mustefa",
      date: "2023-12-28",
      category: "Travel",
      readTime: "10 min read",
      featured: false,
      tags: ["Travel", "Ethiopia", "Practical"],
    },
    {
      id: "6",
      title: "The Psychology of Heritage Language Learning",
      excerpt: "Understanding the emotional journey of reconnecting with your ancestral language.",
      content:
        "Learning your heritage language is more than acquiring new skills—it's an emotional journey of identity and belonging...",
      author: "Mahir Abas Mustefa",
      date: "2023-12-22",
      category: "Psychology",
      readTime: "9 min read",
      featured: false,
      tags: ["Psychology", "Heritage", "Identity"],
    },
  ]

  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  const categories = ["All", "Language Tips", "Culture", "Writing System", "Learning Tips", "Travel", "Psychology"]

  // Placeholder for activeCategory if filtering is implemented
  // const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* The global Navbar from layout.tsx will be used here */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learning Blog</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Insights, tips, and stories to help you master Amharic and connect with Ethiopian culture
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button key={category} variant="outline" size="sm" className="border-primary/30 hover:bg-accent">
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Article</h2>
            {featuredPosts.map((post) => (
              <Card key={post.id} className="shadow-xl mb-6 bg-gradient-to-r from-accent/30 to-background border-border">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-2">
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">{post.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        {post.category}
                      </Badge>
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="border-primary/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2 sm:mt-0">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground">{post.title}</CardTitle>
                  <CardDescription className="leading-relaxed text-muted-foreground">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>Comments</span> {/* Placeholder */}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-border">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full border-primary/30 hover:bg-accent">
                    Read More
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
