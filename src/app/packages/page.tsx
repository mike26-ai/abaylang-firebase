
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Users, Package, Calendar, Star } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"

export default function PackagesPage() {
  const individualLessons = [
    {
      name: "Free Trial",
      duration: "30 minutes",
      price: 0,
      description: "One-time only trial to meet the tutor and experience the teaching style",
      features: [
        "Meet the tutor",
        "Experience the teaching style",
        "Discuss your learning goals",
        "No commitment required",
      ],
      popular: false,
    },
    {
      name: "Quick Practice",
      duration: "30 minutes",
      price: 9,
      description: "Perfect for conversation practice and quick reviews",
      features: [
        "Conversation practice",
        "Pronunciation correction",
        "Quick grammar review",
        "Flexible scheduling",
      ],
      popular: false,
    },
    {
      name: "Comprehensive Lesson",
      duration: "60 minutes",
      price: 16,
      description: "Our most popular lesson format for structured learning",
      features: [
        "Structured lesson plan",
        "Cultural context & stories",
        "Homework & materials",
        "Progress tracking",
      ],
      popular: true,
    },
  ]

  const groupSessions = [
    {
      name: "Quick Group Conversation",
      duration: "30 minutes",
      price: 7,
      maxStudents: "4-6 students",
      description: "Practice with fellow learners in a supportive environment",
      features: [
        "Small group setting (4-6)",
        "Focused conversation practice",
        "Peer learning experience",
        "Themed discussions",
      ],
    },
    {
        name: "Immersive Conversation Practice",
        duration: "60 minutes",
        price: 12,
        maxStudents: "4-6 students",
        description: "An extended session for deeper conversation and cultural insights",
        features: [
          "Extended conversation time",
          "In-depth cultural topics",
          "Collaborative learning",
          "Build fluency with peers",
        ],
      },
  ]

  const packages = [
    {
      name: "Quick Practice Bundle",
      lessons: "10 x 30-min lessons",
      price: 50,
      originalPrice: 70,
      savings: 20,
      description: "Ideal for consistent conversation practice at a great value",
      features: [
        "10 lessons, 30 mins each",
        "Just $5 per lesson",
        "Focus on speaking fluency",
        "Flexible scheduling",
      ],
      popular: true,
    },
    {
        name: "Learning Intensive",
        lessons: "10 x 60-min lessons",
        price: 100,
        originalPrice: 150,
        savings: 50,
        description: "Accelerate your structured learning and save",
        features: [
          "10 lessons, 60 mins each",
          "Just $10 per lesson",
          "Comprehensive curriculum",
          "Priority booking",
        ],
        popular: false,
      },
    {
      name: "Starter Bundle",
      lessons: "5 x 30-min lessons",
      price: 25,
      originalPrice: 35,
      savings: 10,
      description: "A great way to start practicing conversation regularly",
      features: [
        "5 lessons, 30 mins each",
        "Great value to get started",
        "Build conversational confidence",
      ],
      popular: false,
    },
    {
        name: "Foundation Pack",
        lessons: "5 x 60-min lessons",
        price: 60,
        originalPrice: 75,
        savings: 15,
        description: "Build a solid foundation with five structured lessons",
        features: [
          "5 lessons, 60 mins each",
          "Perfect for beginners",
          "Covers core concepts",
        ],
        popular: false,
      },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to ABYLANG</span>
          </Link>
          <Logo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Pricing & Packages</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the learning option that fits your schedule, goals, and budget. All lessons include session
            recordings and materials.
          </p>
        </div>

        {/* Individual Lessons */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Individual Lessons</h2>
            <p className="text-muted-foreground">One-on-one personalized sessions with Mahder</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {individualLessons.map((lesson) => (
              <Card
                key={lesson.name}
                className={`border-border shadow-lg relative ${lesson.popular ? "border-2 border-primary/50 scale-105" : ""}`}
              >
                {lesson.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                 {lesson.price === 0 && (
                    <div className="absolute top-3 left-3 transform">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Free Trial</Badge>
                    </div>
                 )}
                <CardHeader className="text-center pt-10">
                  <CardTitle className="text-xl text-foreground">{lesson.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">${lesson.price}</div>
                  <CardDescription className="text-muted-foreground">
                    {lesson.duration} • {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {lesson.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/bookings?type=${lesson.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button
                      className={`w-full ${lesson.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-foreground hover:bg-foreground/90 text-background"}`}
                    >
                      Book {lesson.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Group Sessions */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Group Sessions</h2>
            <p className="text-muted-foreground">Learn with fellow students in small groups (4-6 people)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {groupSessions.map((session) => (
              <Card key={session.name} className="border-border shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30">Group Session</Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{session.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">${session.price}</div>
                  <CardDescription className="text-muted-foreground">
                    {session.duration} • {session.maxStudents} • {session.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {session.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/bookings?type=${session.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Join Group Session</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Package Deals */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Package Deals</h2>
            <p className="text-muted-foreground">Save money with our lesson packages and intensive programs</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`border-border shadow-lg relative ${pkg.popular ? "border-2 border-primary/50 scale-105" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-primary" />
                    <Badge className="bg-accent text-accent-foreground border-accent/30">Package Deal</Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">${pkg.price}</div>
                  {pkg.originalPrice && <div className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</div>}
                  <div className="text-sm text-primary font-semibold">Save ${pkg.savings}</div>
                  <CardDescription className="text-muted-foreground">
                    {pkg.lessons} • {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/bookings?type=${pkg.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button
                      className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-foreground hover:bg-foreground/90 text-background"}`}
                    >
                      Get {pkg.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can I switch between lesson types?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can book different lesson types based on your current needs and learning goals.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">What's included in package deals?</h4>
                  <p className="text-sm text-muted-foreground">
                    All packages include session recordings, learning materials, progress tracking, and priority
                    booking.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">How do group sessions work?</h4>
                  <p className="text-sm text-muted-foreground">
                    Group sessions have 4-6 students of similar levels, focusing on conversation practice and cultural
                    discussions.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can I cancel or reschedule?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can cancel or reschedule up to 12 hours before your lesson without any penalty.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Do packages expire?</h4>
                  <p className="text-sm text-muted-foreground">
                    Package lessons are valid for 6 months from purchase date, giving you flexibility to schedule.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards, PayPal, and bank transfers through our secure payment system.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Card className="border-border shadow-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Amharic Journey?</h3>
              <p className="mb-6 opacity-90">
                Book your first lesson today and take the first step towards learning Amharic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/bookings">
                  <Button className="bg-background text-primary hover:bg-background/90">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Your First Lesson
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    Have Questions? Contact Mahder
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
