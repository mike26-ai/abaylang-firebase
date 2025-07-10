
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Users, Package, Calendar } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo" // Import the standard Logo component

export default function PackagesPage() { // Renamed from PricingPage to match filename/route
  const individualLessons = [
    {
      name: "Quick Practice",
      duration: "30 minutes",
      price: 25,
      description: "Perfect for conversation practice and quick reviews",
      features: [
        "Conversation practice",
        "Pronunciation correction",
        "Quick grammar review",
        "Session recording",
        "Flexible scheduling",
      ],
      popular: false,
    },
    {
      name: "Comprehensive Lesson",
      duration: "60 minutes",
      price: 45,
      description: "Our most popular lesson format for structured learning",
      features: [
        "Structured lesson plan",
        "Cultural context & stories",
        "Homework & materials",
        "Progress tracking",
        "Session recording",
      ],
      popular: true,
    },
    {
      name: "Cultural Immersion",
      duration: "90 minutes",
      price: 65,
      description: "Deep dive into Ethiopian culture and heritage",
      features: [
        "Traditional stories & proverbs",
        "Cultural customs & etiquette",
        "Family conversation prep",
        "Regional dialects",
        "Cultural materials included",
      ],
      popular: false,
    },
  ]

  const groupSessions = [
    {
      name: "Group Conversation",
      duration: "60 minutes",
      price: 20,
      maxStudents: "4-6 students",
      description: "Practice with fellow learners in a supportive environment",
      features: [
        "Small group setting",
        "Conversation practice",
        "Peer learning experience",
        "Cultural discussions",
        "Session recording",
      ],
    },
  ]

  const packages = [
    {
      name: "Weekly Package",
      lessons: "4 lessons/month",
      price: 160,
      originalPrice: 180,
      savings: 20,
      description: "Perfect for consistent weekly practice",
      features: [
        "4 x 60-minute lessons",
        "Flexible scheduling",
        "Progress tracking",
        "Priority booking",
        "10% discount",
      ],
      popular: false,
    },
    {
      name: "Monthly Intensive",
      lessons: "10 lessons/month",
      price: 400,
      originalPrice: 450,
      savings: 50,
      description: "Accelerated learning for serious students",
      features: [
        "10 x 60-minute lessons",
        "Mix of individual & cultural sessions",
        "Weekly progress reviews",
        "Custom learning materials",
        "15% discount",
      ],
      popular: true,
    },
    {
      name: "Cultural Heritage Package",
      lessons: "12 lessons over 3 months",
      price: 720,
      originalPrice: 780,
      savings: 60,
      description: "Complete cultural immersion experience",
      features: [
        "12 x 90-minute cultural sessions",
        "Traditional story sessions",
        "Cultural materials package",
        "Virtual cultural events access",
        "Certificate of completion",
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
            <span>Back to LissanHub</span>
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
            <p className="text-muted-foreground">One-on-one personalized sessions with Mahir</p>
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
                <CardHeader className="text-center">
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

        {/* Package Highlights */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Popular Lesson Packages</h2>
            <p className="text-muted-foreground">Save more with our lesson bundles - the more you learn, the more you save!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-accent rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">Quick Practice Bundle</CardTitle>
                <div className="text-2xl font-bold text-primary">$220</div>
                <div className="text-sm text-muted-foreground line-through">$250</div>
                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Save $30</Badge>
                <CardDescription className="text-muted-foreground">10 x 30-minute lessons • $22/lesson</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Conversation practice focus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">12% discount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Valid for 4 months</span>
                  </li>
                </ul>
                <Link href="/packages">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">View All Packages</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg border-2 border-primary/50 scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
              </div>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-accent rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">Learning Intensive</CardTitle>
                <div className="text-2xl font-bold text-primary">$304</div>
                <div className="text-sm text-muted-foreground line-through">$360</div>
                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Save $56</Badge>
                <CardDescription className="text-muted-foreground">8 x 60-minute lessons • $38/lesson</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Structured learning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">15% discount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Progress reviews included</span>
                  </li>
                </ul>
                <Link href="/packages">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">View All Packages</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-accent rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg text-foreground">Flexible Learning</CardTitle>
                <div className="text-2xl font-bold text-primary">$280</div>
                <div className="text-sm text-muted-foreground line-through">$320</div>
                <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">Save $40</Badge>
                <CardDescription className="text-muted-foreground">8 mixed lessons • Mix & match</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Mix 30 & 60-min lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">12% discount</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Maximum flexibility</span>
                  </li>
                </ul>
                <Link href="/packages">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">View All Packages</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Separator or clear call to action to view all packages */}
        <div className="text-center mt-8 mb-16">
          <Card className="border-border shadow-lg bg-gradient-to-r from-accent/30 to-background">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Want Even More Savings?</h3>
              <p className="text-muted-foreground mb-4">
                Explore our complete package collection with savings up to 25% and flexible learning options.
              </p>
              <Link href="/packages">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Package className="w-4 h-4 mr-2" />
                  Browse All Packages & Bundles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>


        {/* Group Sessions */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Group Sessions</h2>
            <p className="text-muted-foreground">Learn with fellow students in small groups</p>
          </div>

          <div className="max-w-md mx-auto">
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
                  <Link href={`/bookings?type=group-conversation`}>
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

          <div className="grid md:grid-cols-3 gap-8">
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
                    Yes, you can cancel or reschedule up to 24 hours before your lesson without any penalty.
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
                Book your first lesson today and take the first step towards reconnecting with your Ethiopian heritage.
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
                    Have Questions? Contact Mahir
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

    