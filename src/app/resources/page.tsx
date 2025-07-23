
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, FileText, Library, ExternalLink, ListChecks } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Library className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learning Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Helpful materials and tools to support your Amharic learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="w-6 h-6 text-primary" />
                Lesson Materials
              </CardTitle>
              <CardDescription>
                Access PDF documents, audio, or video links shared by your tutor.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Your tutor will upload materials relevant to your lessons. Find them in your student dashboard.
              </p>
              <Button variant="outline" asChild>
                <Link href="/profile#materials">Go to My Materials</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BookOpen className="w-6 h-6 text-primary" />
                Amharic Flashcards
              </CardTitle>
              <CardDescription>Practice common Amharic words and phrases to build your vocabulary.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">
                Expand your vocabulary with our collection of digital flashcards.
              </p>
              <Button asChild>
                <Link href="/flashcards">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Go to Flashcards
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-3">More Tools Coming Soon!</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
                We are continuously working on adding more resources like interactive quizzes, AI-powered practice tools, and advanced learning paths to enhance your ABYLANG experience.
            </p>
        </div>

      </div>
    </div>
  )
}
