

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, Users, Award, CheckCircle, Play, Globe, Heart, BookOpen, Clock, Package } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState, type ChangeEvent, type FormEvent, useEffect } from "react"
import { addDoc, collection, serverTimestamp, getDocs, query, where, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo, siteConfig } from "@/config/site"
import Image from "next/image"
import type { Testimonial as TestimonialType } from "@/lib/types"; // For fetching testimonials
import { Logo } from "@/components/layout/logo"

export default function HomePage() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoadingTestimonials(true);
      try {
        const testimonialsCol = collection(db, "testimonials");
        // FIX: Query for status, but order in code to avoid needing a composite index
        const q = query(
          testimonialsCol,
          where("status", "==", "approved"),
          limit(10) // Fetch a few recent ones to sort
        );
        const querySnapshot = await getDocs(q);
        const fetchedTestimonials = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestimonialType));
        
        // Sort by date in the client-side code
        fetchedTestimonials.sort((a, b) => {
            const dateA = a.createdAt?.toDate()?.getTime() || 0;
            const dateB = b.createdAt?.toDate()?.getTime() || 0;
            return dateB - dateA;
        });

        setTestimonials(fetchedTestimonials.slice(0, 3)); // Take the top 3 after sorting

      } catch (error: any) {
        console.error("Error fetching testimonials for homepage:", error);
        let description = "Could not load recent testimonials.";
        if (error.code === 'failed-precondition') {
            description = "Could not load testimonials. This often means a required database index is missing. Please check the browser console for a link to create it, or check Firestore indexes.";
        } else if (error.code === 'permission-denied') {
            description = "Could not load testimonials due to a permission issue. Please check Firestore security rules for 'testimonials'.";
        }
        toast({
          title: "Error Loading Testimonials",
          description: description,
          variant: "destructive",
          duration: 9000,
        });
      } finally {
        setIsLoadingTestimonials(false);
      }
    };
    fetchTestimonials();
  }, [toast]);


  const handleContactInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = async (e: FormEvent) => {
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
      setContactForm({ name: "", email: "", message: "" });
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
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Local Header for this Homepage */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#about" className="text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/packages" className="text-muted-foreground hover:text-primary transition-colors">
              Packages
            </Link>
            <Link href="/#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Reviews
            </Link>
            <Link href="/#contact" className="text-muted-foreground hover:text-primary transition-colors">
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
            🌍 Connecting Learners Through Language
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Master
            <span className="text-primary block">Amharic</span>
            with Native Fluency
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Join learners worldwide in live, personalized Amharic lessons. Connect with your heritage, build
            confidence, and speak like a native with expert guidance from Mahder Negash Mamo.
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
              className="text-lg px-8 py-4 h-auto border-primary/30 hover:bg-accent text-foreground"
              asChild
            >
              <Link href="/tutor-profile">
                <Play className="w-5 h-5 mr-2" />
                Meet Your Tutor
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-3">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Global Community</h3>
              <p className="text-sm text-muted-foreground text-center">Students from 5+ countries</p>
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
              <p className="text-sm text-muted-foreground text-center">Rated by 20+ students</p>
            </div>
          </div>
        </div>
      </section>

      {/* About/Tutor Profile Section (Simplified Link) */}
      <section id="about" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-accent text-accent-foreground">Meet Your Tutor</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">{tutorInfo.name}</h2>
              <p className="text-xl text-primary font-medium">{tutorInfo.bio}</p>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Experienced Amharic teacher who makes language learning fun, simple, and interactive. Join me for easy lessons packed with culture and conversation!
                </p>
              </div>
              <Button asChild>
                 <Link href="/tutor-profile">Learn More About {tutorInfo.name.split(' ')[0]}</Link>
              </Button>
            </div>
             <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/50 to-accent/80 rounded-2xl flex items-center justify-center">
                <Image src={tutorInfo.imageUrl} alt={tutorInfo.name} width={400} height={400} className="rounded-2xl object-cover" data-ai-hint={tutorInfo.dataAiHint || "tutor portrait"}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Lessons/Services Section */}
      <section id="lessons" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground">Learning Options</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Choose Your Lesson Type</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Select from our core lesson formats. More options available on the booking page.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 group bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Free Trial</CardTitle>
                <div className="text-3xl font-bold text-primary">$0</div>
                <CardDescription className="text-muted-foreground">30-minute trial session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Meet the tutor</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Experience the teaching style</span></li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 mt-6 text-primary-foreground" asChild>
                  <Link href="/bookings?type=free-trial">Book Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 group relative bg-card">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Quick Practice</CardTitle>
                <div className="text-3xl font-bold text-primary">$7</div>
                <CardDescription className="text-muted-foreground">30-minute focused session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <ul className="space-y-3">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Conversation practice</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Pronunciation correction</span></li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 mt-6 text-primary-foreground" asChild>
                  <Link href="/bookings?type=quick-practice">Book Quick Session</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 group bg-card">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Comprehensive Lesson</CardTitle>
                <div className="text-3xl font-bold text-primary">$15</div>
                <CardDescription className="text-muted-foreground">60-minute deep dive session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Structured lesson plan</span></li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Cultural context</span></li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90 mt-6 text-primary-foreground" asChild>
                  <Link href="/bookings?type=comprehensive-lesson">Book Full Lesson</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="border-primary/30 hover:bg-accent text-foreground text-base" asChild>
              <Link href="/packages">
                <Package className="w-5 h-5 mr-2" />
                View All Packages & Options
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground">Student Success</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">What Our Students Say</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from learners who've connected with the culture
            </p>
          </div>
            {isLoadingTestimonials ? (
                 <div className="flex justify-center"><Spinner size="lg" /></div>
            ) : testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="shadow-lg bg-card">
                    <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-4">
                        "{testimonial.comment}"
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">{testimonial.name.split(" ").map(n=>n[0]).join("").toUpperCase()}</span>
                        </div>
                        <div><div className="font-semibold text-foreground">{testimonial.name}</div><div className="text-sm text-muted-foreground">{testimonial.location || "Global Student"}</div></div>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
            ) : (
                <p className="text-center text-muted-foreground">No approved testimonials yet. Check back soon!</p>
            )}
          <div className="text-center mt-12 space-y-4">
             <Button size="lg" asChild>
                <Link href="/submit-testimonial">Share Your Experience</Link>
             </Button>
             <br/>
            <Button variant="outline" className="border-primary/30 hover:bg-accent text-foreground" asChild>
                <Link href="/testimonials">Read More Reviews</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-primary/5">
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
              <div className="flex gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                    <Link href="/bookings">Book First Lesson</Link>
                </Button>
                <Button variant="outline" className="border-primary/30 hover:bg-accent text-foreground" asChild>
                    <Link href="/contact">Send Message</Link>
                </Button>
              </div>
            </div>

            <Card className="shadow-lg bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Contact</CardTitle>
                <CardDescription className="text-muted-foreground">Send me a message and I'll get back to you within 24 hours</CardDescription>
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

      <footer className="bg-foreground text-background py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2 group">
              <div className="footer-logo">
                <Logo />
              </div>
              <p className="text-muted-foreground mt-4 mb-4 max-w-md">
                {siteConfig.description}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-background">Learning</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/bookings" className="hover:text-background">Book Lesson</Link></li>
                <li><Link href="/tutor-profile" className="hover:text-background">About Mahder</Link></li>
                <li><Link href="/testimonials" className="hover:text-background">Reviews</Link></li>
                 <li><Link href="/packages" className="hover:text-background">View Packages</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-background">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/contact" className="hover:text-background">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-background">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-background">Terms</Link></li>
                <li><Link href="/faq" className="hover:text-background">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Made with ❤️ for the Amharic learning community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
