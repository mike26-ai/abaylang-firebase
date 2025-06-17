
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Link as LinkIcon } from "lucide-react" // Added LinkIcon
import { Button } from "@/components/ui/button"; // Added Button
import Link from "next/link"; // Added Link

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learning Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Helpful materials to support your Amharic learning journey.
          </p>
        </div>

        <Tabs defaultValue="lesson-materials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 bg-card border">
            <TabsTrigger
              value="lesson-materials"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Lesson Materials
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Flashcards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lesson-materials" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Shared Lesson Files
                </CardTitle>
                <CardDescription>Access PDF documents, audio, or video links shared by your tutor. (Admin manages these via Admin Panel &rarr; Manage Materials)</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Your tutor may share materials specific to your lessons. Check back here or ask your tutor.
                </p>
                <p className="text-sm text-muted-foreground">
                  (For MVP, this section would list materials uploaded by admin. Functionality to list them for students is a future step.)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Amharic Flashcards
                </CardTitle>
                <CardDescription>Practice common Amharic words and phrases.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                 <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">
                  Expand your vocabulary with our collection of digital flashcards.
                </p>
                <Button asChild>
                  <Link href="/flashcards">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Go to Flashcards
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
