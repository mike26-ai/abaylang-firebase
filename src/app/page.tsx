"use client"
// This page uses its own local header and footer as per the new design.
// The global Navbar and Footer from src/app/layout.tsx will still wrap this content.
// If this is not desired, layout.tsx or middleware would need adjustment.

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Users, Award, CheckCircle, Play, Globe, Heart, BookOpen, Clock } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo" // Import the Logo component
import { Input } from "@/components/ui/input" // For contact form
import { Textarea } from "@/components/ui/textarea" // For contact form
import { useToast } from "@/hooks/use-toast" // For contact form submission
import { useState } from "react" // For contact form
import { addDoc, collection, serverTimestamp } from "firebase/firestore" // For contact form
import { db } from "@/lib/firebase" // For contact form
import { Spinner } from "@/components/ui/spinner" // For contact form loading
import { tutorInfo } from "@/config/site" // To get tutor name
import Image from "next/image" // For tutor image if available

export default function HomePage() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        createdAt: serverTimestamp(),
        read: false,
      });
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });
      setContactForm({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error Sending Message",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background"> {/* Adjusted gradient to theme */}
      {/* Local Header for this Homepage */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo /> {/* Use the Logo component */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="#lessons" className="text-muted-foreground hover:text-primary transition-colors">
              Lessons
            </Link>
            {/* Resources link can be added to siteConfig.mainNav if it's a separate page */}
            {/* <Link href="#resources" className="text-muted-foreground hover:text-primary transition-colors">
              Resources
            </Link> */}
            <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Reviews
            </Link>
            {/* More dropdown can be implemented later using DropdownMenu component */}
            {/* <Link href="#more" className="text-muted-foreground hover:text-primary transition-colors">
              More <ChevronDown className="inline h-4 w-4" />
            </Link> */}
            <Link href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/register">Start Learning</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge className="mb-6 bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2">
            🌍 Connecting Diaspora Through Language
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Master
            <span className="text-primary block">Amharic</span>
            with Native Fluency
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Join diaspora learners worldwide in live, personalized Amharic lessons. Connect with your heritage, build
            confidence, and speak like a native with expert guidance from {tutorInfo.name}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto text-primary-foreground" asChild>
              <Link href="/bookings">
                <Calendar className="w-5 h-5 mr-2" />
                Book Your First Lesson
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 h-auto border-primary/30 hover:bg-accent"
              asChild
            >
              <Link href="#about">
                <Play className="w-5 h-5 mr-2" />
                Meet Your Tutor
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-3">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Global Community</h3>
              <p className="text-sm text-muted-foreground text-center">Students from 15+ countries</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-3">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Cultural Connection</h3>
              <p className="text-sm text-muted-foreground text-center">Learn language & heritage</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-3">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Personalized Learning</h3>
              <p className="text-sm text-muted-foreground text-center">Tailored to your goals</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">5-Star Experience</h3>
              <p className="text-sm text-muted-foreground text-center">Rated by 200+ students</p>
            </div>
          </div>
        </div>
      </section>

      {/* About/Tutor Profile Section */}
      <section id="about" className="py-20 px-4 bg-card"> {/* Changed to bg-card for white */}
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-accent text-accent-foreground">Meet Your Tutor</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">{tutorInfo.name}</h2>
              <p className="text-xl text-primary font-medium">{tutorInfo.shortIntro}</p>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ሰላም! {tutorInfo.bio.split('.')[0]}. {/* Displaying first sentence of bio */}
                </p>
                <p>
                  {tutorInfo.bio.substring(tutorInfo.bio.indexOf('.') + 1).trim()} {/* Displaying rest of bio */}
                </p>
              </div>

              {/* Credentials */}
              <div className="grid md:grid-cols-2 gap-4">
                {tutorInfo.services.map((service, index) => (
                   <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-sm">Native Amharic Speaker</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                    <Link href="/bookings">Book a Lesson</Link>
                </Button>
                {tutorInfo.videoUrl && (
                    <Button variant="outline" className="border-primary/30 hover:bg-accent" asChild>
                        <Link href={tutorInfo.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4 mr-2" />
                            Watch Introduction
                        </Link>
                    </Button>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/50 to-accent/80 rounded-2xl flex items-center justify-center">
                {tutorInfo.imageUrl.includes('placehold.co') ? (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl text-primary-foreground font-bold">{tutorInfo.name.split(" ").map(n=>n[0]).join("")}</span>
                    </div>
                    <p className="text-primary font-medium">Professional Photo Coming Soon</p>
                  </div>
                ) : (
                  <Image src={tutorInfo.imageUrl} alt={tutorInfo.name} width={400} height={400} className="rounded-2xl object-cover" data-ai-hint={tutorInfo.dataAiHint || "tutor portrait"}/>
                )}
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border">
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">Happy Students</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-card rounded-xl shadow-lg p-4 border">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">5.0 Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons/Services Section */}
      <section id="lessons" className="py-20 px-4 bg-muted/30"> {/* Adjusted bg to theme */}
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground">Learning Options</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Choose Your Learning Journey</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Flexible lesson formats designed for busy diaspora learners. From quick conversation practice to
              comprehensive cultural immersion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Quick Practice */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Quick Practice</CardTitle>
                <div className="text-3xl font-bold text-primary">$25</div>
                <CardDescription>30-minute focused session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Conversation practice</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Pronunciation correction</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Quick grammar review</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Session recording</span></li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 mt-6 text-primary-foreground" asChild>
                  <Link href="/bookings?type=quick">Book Quick Session</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Comprehensive Lesson */}
            <Card className="border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Comprehensive Lesson</CardTitle>
                <div className="text-3xl font-bold text-primary">$45</div>
                <CardDescription>60-minute deep dive session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Structured lesson plan</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Cultural context & stories</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Homework & materials</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Progress tracking</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Session recording</span></li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 mt-6 text-primary-foreground" asChild>
                  <Link href="/bookings?type=comprehensive">Book Full Lesson</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Cultural Immersion */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Cultural Immersion</CardTitle>
                <div className="text-3xl font-bold text-primary">$65</div>
                <CardDescription>90-minute heritage journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Traditional stories & proverbs</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Cultural customs & etiquette</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Family conversation prep</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Regional dialects</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Cultural materials included</span></li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 mt-6 text-primary-foreground" asChild>
                  <Link href="/bookings?type=cultural">Book Cultural Session</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Learning Approach */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-8">My Teaching Approach</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Assess Your Level</h4>
                <p className="text-sm text-muted-foreground">
                  We start by understanding your current Amharic knowledge and learning goals
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Personalized Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Create a custom learning path that fits your schedule and objectives
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Practice & Progress</h4>
                <p className="text-sm text-muted-foreground">Regular practice with real-world scenarios and cultural context</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-card"> {/* Changed to bg-card */}
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground">Student Success</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">What Students Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from diaspora learners who've reconnected with their heritage through Amharic
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Static Testimonials - can be replaced with dynamic fetching */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "Mahir helped me reconnect with my Ethiopian roots. After just 3 months, I can finally have meaningful
                  conversations with my grandmother. The cultural context he provides makes all the difference."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">SM</span>
                  </div>
                  <div><div className="font-semibold text-foreground">Sara M.</div><div className="text-sm text-muted-foreground">Second-generation Ethiopian, Toronto</div></div>
                </div>
              </CardContent>
            </Card>
             <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "As someone who grew up speaking English, learning Amharic felt impossible. Mahir's patient teaching
                  style and cultural stories made it enjoyable. Now I'm planning my first trip to Ethiopia!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">DK</span>
                  </div>
                  <div><div className="font-semibold text-foreground">Daniel K.</div><div className="text-sm text-muted-foreground">Third-generation Ethiopian, London</div></div>
                </div>
              </CardContent>
            </Card>
             <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "The flexibility of online lessons fits perfectly with my busy schedule. Mahir's teaching goes beyond
                  language - I'm learning about my culture and heritage. Highly recommend!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">AL</span>
                  </div>
                  <div><div className="font-semibold text-foreground">Aisha L.</div><div className="text-sm text-muted-foreground">Working Professional, Washington DC</div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-primary/30 hover:bg-accent" asChild>
                <Link href="/testimonials">Read More Success Stories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-primary/5"> {/* Adjusted bg to theme */}
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent text-accent-foreground">Get in Touch</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-muted-foreground">
              Have questions? Want to discuss your learning goals? I'm here to help you begin your Amharic journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">Let's Connect</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a complete beginner or looking to improve your existing Amharic skills, I'm excited to
                help you connect with your Ethiopian heritage through language.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-primary" /></div><div><div className="font-semibold text-foreground">Book a Free Consultation</div><div className="text-sm text-muted-foreground">15-minute chat to discuss your goals</div></div></div>
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div><div><div className="font-semibold text-foreground">Join the Community</div><div className="text-sm text-muted-foreground">Connect with other learners</div></div></div>
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center"><Award className="w-5 h-5 text-primary" /></div><div><div className="font-semibold text-foreground">Flexible Scheduling</div><div className="text-sm text-muted-foreground">Lessons that fit your timezone</div></div></div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                    <Link href="/bookings">Book First Lesson</Link>
                </Button>
                <Button variant="outline" className="border-primary/30 hover:bg-accent" asChild>
                    <Link href="/contact">Send Message</Link>
                </Button>
              </div>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Contact</CardTitle>
                <CardDescription>Send me a message and I'll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium text-foreground block mb-1">Name</label>
                      <Input id="name" name="name" value={contactForm.name} onChange={handleContactInputChange} required placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1">Email</label>
                      <Input id="email" name="email" type="email" value={contactForm.email} onChange={handleContactInputChange} required placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="text-sm font-medium text-foreground block mb-1">Message</label>
                    <Textarea id="message" name="message" value={contactForm.message} onChange={handleContactInputChange} required rows={4} placeholder="Tell me about your learning goals..." />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmittingContact}>
                    {isSubmittingContact ? <Spinner size="sm" className="mr-2" /> : null}
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Local Footer for this Homepage */}
      <footer className="bg-foreground text-background py-12 px-4"> {/* Adjusted to theme */}
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo showText={true} className="mb-4"/> {/* Use Logo component */}
              <p className="text-muted-foreground mb-4 max-w-md"> {/* text-gray-400 -> text-muted-foreground */}
                Connecting diaspora learners with their Ethiopian heritage through personalized Amharic lessons and
                cultural immersion.
              </p>
              {/* Social media icons can be actual icons */}
              <div className="flex gap-4">
                <Link href="#" className="w-8 h-8 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center text-sm">FB</Link>
                <Link href="#" className="w-8 h-8 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center text-sm">IG</Link>
                <Link href="#" className="w-8 h-8 bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center text-sm">YT</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground">Learning</h3> {/* text-white -> text-primary-foreground (or just text-background if on dark bg) */}
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/bookings" className="hover:text-primary-foreground">Book Lesson</Link></li>
                {/* <li><Link href="/pricing" className="hover:text-primary-foreground">Pricing</Link></li> Pricing page not in current sitemap */}
                <li><Link href="/tutor-profile" className="hover:text-primary-foreground">About Mahir</Link></li>
                <li><Link href="/testimonials" className="hover:text-primary-foreground">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary-foreground">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/contact" className="hover:text-primary-foreground">Contact</Link></li>
                {/* <li><Link href="/faq" className="hover:text-primary-foreground">FAQ</Link></li> FAQ page not in current sitemap */}
                <li><Link href="/privacy" className="hover:text-primary-foreground">Privacy</Link></li>
                <li><Link href="/terms" className
="hover:text-primary-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} LissanHub. Made with ❤️ for the Ethiopian diaspora community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
