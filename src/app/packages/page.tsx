
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, Clock, Package, Star, Users, Calendar, Gift, Zap, Target } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo" // Import Logo component

export default function PackagesPage() {
  const [selectedCategory, setSelectedCategory] = useState("individual")

  // 30-minute lesson packages
  const quickPracticePackages = [
    {
      id: "quick-5",
      name: "Starter Pack",
      lessons: 5,
      duration: 30,
      originalPrice: 125,
      discountedPrice: 115,
      savings: 10,
      discountPercent: 8,
      pricePerLesson: 23,
      originalPricePerLesson: 25,
      popular: false,
      features: [
        "5 x 30-minute lessons",
        "Conversation practice focus",
        "Pronunciation correction",
        "Session recordings",
        "Valid for 3 months",
        "Flexible scheduling",
      ],
      bestFor: "New learners wanting to try regular practice",
    },
    {
      id: "quick-10",
      name: "Practice Bundle",
      lessons: 10,
      duration: 30,
      originalPrice: 250,
      discountedPrice: 220,
      savings: 30,
      discountPercent: 12,
      pricePerLesson: 22,
      originalPricePerLesson: 25,
      popular: true,
      features: [
        "10 x 30-minute lessons",
        "Conversation practice focus",
        "Pronunciation correction",
        "Session recordings",
        "Valid for 4 months",
        "Priority booking",
        "Progress tracking",
      ],
      bestFor: "Regular practice and conversation improvement",
    },
    {
      id: "quick-20",
      name: "Fluency Accelerator",
      lessons: 20,
      duration: 30,
      originalPrice: 500,
      discountedPrice: 420,
      savings: 80,
      discountPercent: 16,
      pricePerLesson: 21,
      originalPricePerLesson: 25,
      popular: false,
      features: [
        "20 x 30-minute lessons",
        "Conversation practice focus",
        "Pronunciation correction",
        "Session recordings",
        "Valid for 6 months",
        "Priority booking",
        "Progress tracking",
        "Monthly progress reviews",
      ],
      bestFor: "Intensive conversation practice and fluency building",
    },
  ]

  // 60-minute lesson packages
  const comprehensivePackages = [
    {
      id: "comp-4",
      name: "Monthly Essentials",
      lessons: 4,
      duration: 60,
      originalPrice: 180,
      discountedPrice: 160,
      savings: 20,
      discountPercent: 11,
      pricePerLesson: 40,
      originalPricePerLesson: 45,
      popular: false,
      features: [
        "4 x 60-minute lessons",
        "Structured lesson plans",
        "Cultural context & stories",
        "Homework & materials",
        "Session recordings",
        "Valid for 2 months",
        "Progress tracking",
      ],
      bestFor: "Consistent weekly learning with structured approach",
    },
    {
      id: "comp-8",
      name: "Learning Intensive",
      lessons: 8,
      duration: 60,
      originalPrice: 360,
      discountedPrice: 304,
      savings: 56,
      discountPercent: 15,
      pricePerLesson: 38,
      originalPricePerLesson: 45,
      popular: true,
      features: [
        "8 x 60-minute lessons",
        "Structured lesson plans",
        "Cultural context & stories",
        "Homework & materials",
        "Session recordings",
        "Valid for 4 months",
        "Priority booking",
        "Bi-weekly progress reviews",
        "Custom learning materials",
      ],
      bestFor: "Serious learners wanting structured progression",
    },
    {
      id: "comp-15",
      name: "Mastery Program",
      lessons: 15,
      duration: 60,
      originalPrice: 675,
      discountedPrice: 540,
      savings: 135,
      discountPercent: 20,
      pricePerLesson: 36,
      originalPricePerLesson: 45,
      popular: false,
      features: [
        "15 x 60-minute lessons",
        "Structured lesson plans",
        "Cultural context & stories",
        "Homework & materials",
        "Session recordings",
        "Valid for 6 months",
        "Priority booking",
        "Weekly progress reviews",
        "Custom learning materials",
        "Certificate of completion",
        "Bonus cultural immersion session",
      ],
      bestFor: "Comprehensive learning journey with certification",
    },
  ]

  // Mixed packages combining both lesson types
  const mixedPackages = [
    {
      id: "mixed-flex",
      name: "Flexible Learning",
      lessons: "8 lessons (mix & match)",
      originalPrice: 320,
      discountedPrice: 280,
      savings: 40,
      discountPercent: 12,
      features: [
        "Choose any combination:",
        "• 30-min conversation practice",
        "• 60-min comprehensive lessons",
        "• 90-min cultural immersion",
        "Session recordings",
        "Valid for 4 months",
        "Priority booking",
        "Progress tracking",
      ],
      bestFor: "Learners who want variety and flexibility",
      popular: false,
    },
    {
      id: "mixed-balanced",
      name: "Balanced Approach",
      lessons: "12 lessons (6+6)",
      originalPrice: 420,
      discountedPrice: 350,
      savings: 70,
      discountPercent: 17,
      features: [
        "6 x 30-minute conversation practice",
        "6 x 60-minute comprehensive lessons",
        "Perfect balance of practice & learning",
        "Session recordings",
        "Valid for 5 months",
        "Priority booking",
        "Progress tracking",
        "Monthly progress reviews",
      ],
      bestFor: "Balanced learning with conversation and structure",
      popular: true,
    },
  ]

  // Group session packages
  const groupPackages = [
    {
      id: "group-4",
      name: "Group Starter",
      lessons: 4,
      duration: 60,
      originalPrice: 80,
      discountedPrice: 70,
      savings: 10,
      discountPercent: 12,
      pricePerLesson: 17.5,
      originalPricePerLesson: 20,
      features: [
        "4 x 60-minute group sessions",
        "4-6 students per group",
        "Conversation practice focus",
        "Cultural discussions",
        "Session recordings",
        "Valid for 2 months",
      ],
      bestFor: "Social learners who enjoy group dynamics",
      popular: false,
    },
    {
      id: "group-8",
      name: "Group Immersion",
      lessons: 8,
      duration: 60,
      originalPrice: 160,
      discountedPrice: 128,
      savings: 32,
      discountPercent: 20,
      pricePerLesson: 16,
      originalPricePerLesson: 20,
      features: [
        "8 x 60-minute group sessions",
        "4-6 students per group",
        "Conversation practice focus",
        "Cultural discussions",
        "Session recordings",
        "Valid for 4 months",
        "Group progress tracking",
      ],
      bestFor: "Extended group learning experience",
      popular: true,
    },
  ]

  // VIP and premium packages
  const premiumPackages = [
    {
      id: "vip-monthly",
      name: "VIP Monthly",
      lessons: "Unlimited*",
      originalPrice: 800,
      discountedPrice: 600,
      savings: 200,
      discountPercent: 25,
      features: [
        "Up to 12 lessons per month",
        "Mix of 30-min and 60-min sessions",
        "Priority booking (24/7)",
        "Instant rescheduling",
        "Personal learning plan",
        "Weekly progress calls",
        "Custom materials creation",
        "WhatsApp support",
        "Cultural event invitations",
      ],
      bestFor: "Serious learners wanting maximum flexibility",
      popular: false,
      isVIP: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to LissanHub</span>
          </Link>
          <Logo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-accent text-accent-foreground">Lesson Packages & Bundles</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Save More, Learn More</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our carefully crafted lesson packages designed to fit your learning style and budget. The more
            you learn, the more you save!
          </p>
        </div>

        {/* Package Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-card border p-1">
              <TabsTrigger
                value="individual"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Clock className="w-4 h-4 mr-2" />
                Individual Lessons
              </TabsTrigger>
              <TabsTrigger
                value="mixed"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Zap className="w-4 h-4 mr-2" />
                Mixed Packages
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Group Sessions
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                <Star className="w-4 h-4 mr-2" />
                VIP & Premium
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="individual" className="space-y-12">
            {/* 30-minute packages */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">30-Minute Conversation Practice Packages</h2>
                <p className="text-muted-foreground">Perfect for regular conversation practice and pronunciation improvement</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {quickPracticePackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`border-border shadow-lg relative ${pkg.popular ? "border-2 border-primary/50 scale-105" : ""}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl text-foreground">{pkg.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-primary">${pkg.discountedPrice}</div>
                        <div className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</div>
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                          Save ${pkg.savings} ({pkg.discountPercent}% off)
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${pkg.pricePerLesson}/lesson (was ${pkg.originalPricePerLesson})
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-3 bg-accent/70 rounded-lg">
                        <div className="font-semibold text-accent-foreground">{pkg.bestFor}</div>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90" : "bg-foreground hover:bg-foreground/90 text-background"}`}>
                        <Link href={`/bookings?packageId=${pkg.id}`}>
                          <Package className="w-4 h-4 mr-2" />
                          Get {pkg.name}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 60-minute packages */}
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">60-Minute Comprehensive Lesson Packages</h2>
                <p className="text-muted-foreground">Structured learning with cultural context and comprehensive materials</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {comprehensivePackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`border-border shadow-lg relative ${pkg.popular ? "border-2 border-primary/50 scale-105" : ""}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full mx-auto mb-4 flex items-center justify-center"> {/* Example secondary accent color */}
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl text-foreground">{pkg.name}</CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold text-primary">${pkg.discountedPrice}</div>
                        <div className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</div>
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                          Save ${pkg.savings} ({pkg.discountPercent}% off)
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${pkg.pricePerLesson}/lesson (was ${pkg.originalPricePerLesson})
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                        <div className="font-semibold text-blue-700">{pkg.bestFor}</div>
                      </div>
                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                       <Button asChild className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90" : "bg-foreground hover:bg-foreground/90 text-background"}`}>
                        <Link href={`/bookings?packageId=${pkg.id}`}>
                          <Package className="w-4 h-4 mr-2" />
                          Get {pkg.name}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mixed" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Mixed Learning Packages</h2>
              <p className="text-muted-foreground">Combine different lesson types for a well-rounded learning experience</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {mixedPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`border-border shadow-lg relative ${pkg.popular ? "border-2 border-primary/50" : ""}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-purple-500/10 rounded-full mx-auto mb-4 flex items-center justify-center"> {/* Example accent */}
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{pkg.name}</CardTitle>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">${pkg.discountedPrice}</div>
                      <div className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</div>
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        Save ${pkg.savings} ({pkg.discountPercent}% off)
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{pkg.lessons}</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-purple-500/5 rounded-lg">
                      <div className="font-semibold text-purple-700">{pkg.bestFor}</div>
                    </div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90" : "bg-foreground hover:bg-foreground/90 text-background"}`}>
                      <Link href={`/bookings?packageId=${pkg.id}`}>
                        <Package className="w-4 h-4 mr-2" />
                        Get {pkg.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="group" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Group Session Packages</h2>
              <p className="text-muted-foreground">Learn with fellow students in small, supportive groups</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {groupPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`border-border shadow-lg relative ${pkg.popular ? "border-2 border-primary/50" : ""}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-orange-500/10 rounded-full mx-auto mb-4 flex items-center justify-center"> {/* Example accent */}
                      <Users className="w-8 h-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{pkg.name}</CardTitle>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-primary">${pkg.discountedPrice}</div>
                      <div className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</div>
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        Save ${pkg.savings} ({pkg.discountPercent}% off)
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${pkg.pricePerLesson}/lesson (was ${pkg.originalPricePerLesson})
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-3 bg-orange-500/5 rounded-lg">
                      <div className="font-semibold text-orange-700">{pkg.bestFor}</div>
                    </div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className={`w-full ${pkg.popular ? "bg-primary hover:bg-primary/90" : "bg-foreground hover:bg-foreground/90 text-background"}`}>
                      <Link href={`/bookings?packageId=${pkg.id}`}>
                        <Package className="w-4 h-4 mr-2" />
                        Get {pkg.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="premium" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">VIP & Premium Packages</h2>
              <p className="text-muted-foreground">Exclusive access and premium features for serious learners</p>
            </div>
            <div className="max-w-2xl mx-auto">
              {premiumPackages.map((pkg) => (
                <Card key={pkg.id} className="border-border shadow-xl bg-gradient-to-br from-yellow-400/10 via-amber-500/10 to-orange-500/10">
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Star className="w-10 h-10 text-white" />
                    </div>
                    <Badge className="mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300">
                      VIP EXCLUSIVE
                    </Badge>
                    <CardTitle className="text-2xl text-foreground">{pkg.name}</CardTitle>
                    <div className="space-y-1">
                      <div className="text-4xl font-bold text-orange-600">${pkg.discountedPrice}</div>
                      <div className="text-xl text-muted-foreground line-through">${pkg.originalPrice}</div>
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        Save ${pkg.savings} ({pkg.discountPercent}% off)
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{pkg.lessons}</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-400/5 to-orange-500/5 rounded-lg">
                      <div className="font-semibold text-orange-700">{pkg.bestFor}</div>
                    </div>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white">
                      <Link href={`/bookings?packageId=${pkg.id}`}>
                        <Star className="w-4 h-4 mr-2" />
                        Get VIP Access
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Comparison Table */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Package Comparison</h2>
            <p className="text-muted-foreground">Compare savings across different package sizes</p>
          </div>

          <Card className="border-border shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent">
                    <tr>
                      <th className="text-left p-4 font-semibold text-accent-foreground">Package Size</th>
                      <th className="text-center p-4 font-semibold text-accent-foreground">30-min Lessons</th>
                      <th className="text-center p-4 font-semibold text-accent-foreground">60-min Lessons</th>
                      <th className="text-center p-4 font-semibold text-accent-foreground">Group Sessions</th>
                      <th className="text-center p-4 font-semibold text-accent-foreground">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">Single Lesson</td>
                      <td className="text-center p-4 text-muted-foreground">$25</td>
                      <td className="text-center p-4 text-muted-foreground">$45</td>
                      <td className="text-center p-4 text-muted-foreground">$20</td>
                      <td className="text-center p-4 text-muted-foreground">-</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="p-4 font-medium text-foreground">Small Package (4-5 lessons)</td>
                      <td className="text-center p-4 text-muted-foreground">$23/lesson</td>
                      <td className="text-center p-4 text-muted-foreground">$40/lesson</td>
                      <td className="text-center p-4 text-muted-foreground">$17.5/lesson</td>
                      <td className="text-center p-4 text-primary font-semibold">8-12%</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">Medium Package (8-10 lessons)</td>
                      <td className="text-center p-4 text-muted-foreground">$22/lesson</td>
                      <td className="text-center p-4 text-muted-foreground">$38/lesson</td>
                      <td className="text-center p-4 text-muted-foreground">$16/lesson</td>
                      <td className="text-center p-4 text-primary font-semibold">12-20%</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/30">
                      <td className="p-4 font-medium text-foreground">Large Package (15-20 lessons)</td>
                      <td className="text-center p-4 text-muted-foreground">$21/lesson</td>
                      <td className="text-center p-4 text-muted-foreground">$36/lesson</td>
                      <td className="text-center p-4 text-muted-foreground">-</td>
                      <td className="text-center p-4 text-primary font-semibold">16-20%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="border-border shadow-lg mt-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Package FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">How long are packages valid?</h4>
                  <p className="text-sm text-muted-foreground">
                    Package validity ranges from 2-6 months depending on size. Larger packages have longer validity
                    periods for maximum flexibility.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can I mix lesson types in a package?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our Mixed Packages allow you to combine different lesson types. Individual packages are specific to
                    one lesson type for focused learning.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">What if I need to cancel lessons?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can cancel or reschedule lessons up to 24 hours in advance without penalty. Unused lessons
                    remain in your package until expiry.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Do packages include materials?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! All packages include session recordings, learning materials, and progress tracking. Premium
                    packages include additional custom materials.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can I upgrade my package?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can upgrade to a larger package anytime and we'll credit your remaining lessons toward the new
                    package.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Are there family discounts?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Contact us for special family rates when multiple family members want to learn Amharic
                    together.
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
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Learning Journey?</h3>
              <p className="mb-6 opacity-90">
                Choose the perfect package for your learning goals and start saving today. All packages come with our
                satisfaction guarantee.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="bg-background text-primary hover:bg-background/90">
                    <Link href="/bookings">
                      <Calendar className="w-4 h-4 mr-2" />
                      Browse & Book Now
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
                    <Link href="/contact">
                      <Gift className="w-4 h-4 mr-2" />
                      Get Custom Quote
                    </Link>
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Note to AI: Ensure the import for Logo component is added if not already present.
// Ensure all hardcoded colors (e.g. bg-emerald-100, text-gray-900) are replaced with theme variables 
// (e.g. bg-accent, text-foreground) for consistency with globals.css.
// Link for package selection buttons should lead to /bookings (or /bookings?packageId=PKG_ID if desired)
// The logo in the header should use the <Logo /> component.
// "Browse All Packages" button in CTA should likely go to /bookings.
```