"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Users, Package, Calendar, Star, Info, PlusCircle } from "lucide-react"
import Link from "next/link"
import { SiteLogo } from "@/components/layout/SiteLogo"
import { products } from "@/config/products"

type Product = typeof products[keyof typeof products];

export default function PackagesPage() {

  const individualLessons = Object.values(products).filter(p => p.type === 'individual');
  const groupSessions = Object.values(products).filter(p => p.type === 'group');
  const privateGroup = Object.values(products).filter(p => p.type === 'private-group');
  const packages = Object.values(products).filter(p => p.type === 'package');

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to ABYLANG</span>
          </Link>
          <SiteLogo />
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
        
         {/* Private Group Session */}
        <div className="mb-16">
             <Card className="shadow-xl bg-gradient-to-tr from-accent/50 to-background border-primary/20">
                <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <Badge className="bg-primary text-primary-foreground mb-3">Unique Offering</Badge>
                         <h2 className="text-2xl font-bold text-foreground mb-2">Private Group Lessons</h2>
                         <p className="text-muted-foreground mb-4">Organize a private lesson exclusively for your friends, family, or colleagues. Choose between a 30-minute or 60-minute session.</p>
                         <ul className="space-y-2 mb-6">
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">Your own private group (2-6 people)</span>
                            </li>
                             <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">Flexible scheduling</span>
                            </li>
                             <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">Content tailored to your group&apos;s needs</span>
                            </li>
                        </ul>
                        <Button asChild size="lg">
                            <Link href="/bookings/private-group">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create Your Private Group
                            </Link>
                        </Button>
                    </div>
                    <div className="text-center p-6 bg-background rounded-lg border">
                         <Users className="w-16 h-16 text-primary mx-auto mb-4"/>
                         <p className="font-semibold text-foreground">Perfect for families or friends learning together.</p>
                    </div>
                </CardContent>
             </Card>
        </div>

        {/* Package Deals */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Save with Lesson Packages</h2>
            <p className="text-muted-foreground">Get the best value by purchasing lesson credits in bulk.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className="border-border shadow-lg relative"
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-primary" />
                    <Badge className="bg-accent text-accent-foreground border-accent/30">Package Deal</Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{pkg.label}</CardTitle>
                  <div className="text-3xl font-bold text-primary">${pkg.price}</div>
                  {pkg.originalPrice && <div className="text-lg text-muted-foreground line-through">${pkg.originalPrice}</div>}
                  <CardDescription className="text-muted-foreground">
                    {pkg.duration} • {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {(pkg.features as string[]).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                     <Link href={`/bookings?lessonType=${pkg.id}`}>Get Package</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>


        {/* Group Sessions */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Public Group Sessions</h2>
            <p className="text-muted-foreground">Learn with fellow students in small, scheduled groups.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {groupSessions.map((session) => (
              <Card key={session.id} className="border-border shadow-lg">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <Badge className="bg-secondary text-secondary-foreground">Group Session</Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{session.label}</CardTitle>
                  <div className="text-3xl font-bold text-primary">${session.price}</div>
                  <CardDescription className="text-muted-foreground">
                    {session.duration} mins • {session.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {(session.features as string[]).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href={`/bookings?lessonType=${session.id}`}>View Schedule</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Individual Lessons */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Individual Lessons</h2>
            <p className="text-muted-foreground">One-on-one personalized sessions with Mahder.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {individualLessons.map((lesson) => (
              <Card key={lesson.id} className="border-border shadow-lg relative">
                 {(lesson as any).price === 0 && (
                    <div className="absolute top-3 left-3 transform">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">Free Trial</Badge>
                    </div>
                 )}
                <CardHeader className="text-center pt-10">
                  <CardTitle className="text-xl text-foreground">{lesson.label}</CardTitle>
                  <div className="text-3xl font-bold text-primary">${lesson.price}</div>
                  <CardDescription className="text-muted-foreground">
                    {lesson.duration} minutes • {lesson.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {(lesson.features as string[]).map((feature: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href={`/bookings?lessonType=${lesson.id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-border shadow-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Amharic Journey?</h3>
            <p className="mb-6 opacity-90">
              Book your first lesson today and take the first step towards learning Amharic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-background text-primary hover:bg-background/90">
                <Link href="/bookings">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Your First Lesson
                </Link>
              </Button>
              <Button variant="outline" className="border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="/contact">
                  Have Questions? Contact Mahder
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
