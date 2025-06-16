
"use client"

// import { useState, useEffect } from "react" // MVP: Simplify/defer complex resources
// import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  // Brain, // MVP: Defer
  // FileText,
  // Headphones,
  // Play,
  // Download,
  // Star,
  // Trophy,
  // Zap,
  // Volume2,
  // MessageCircle,
  // MicVocal,
  // Loader2,
} from "lucide-react"
// import { AIChatbot } from "@/components/ai/AIChatbot" // MVP: Defer
// import { PronunciationFeedbackTool } from "@/components/ai/PronunciationFeedbackTool" // MVP: Defer
// import { FlashcardPractice, type Flashcard } from "@/components/flashcards/FlashcardPractice" // MVP: Defer dynamic flashcards
// import { HomeworkSubmission } from "@/components/homework/HomeworkSubmission" // MVP: Defer homework
// import type { HomeworkAssignment, HomeworkSubmissionType } from "@/lib/types"
// import { useAuth } from "@/hooks/use-auth"
// import { db } from "@/lib/firebase"
// import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
// import { useToast } from "@/hooks/use-toast"
// import { Spinner } from "@/components/ui/spinner"


export default function ResourcesPage() {
  // const { user } = useAuth(); // MVP: Defer auth-dependent resources
  // const { toast } = useToast(); // MVP: Defer toasts for complex resource interactions
  // const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]); // MVP: Defer
  // const [isLoadingAssignments, setIsLoadingAssignments] = useState(true); // MVP: Defer

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learning Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Helpful materials to support your Amharic learning journey. More interactive tools coming soon!
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 bg-card border"> {/* MVP: Simplified tabs */}
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              General Resources
            </TabsTrigger>
            {/* MVP: Defer other resource categories for now */}
            {/* <TabsTrigger value="flashcards">Flashcards</TabsTrigger> */}
            {/* <TabsTrigger value="assignments">Assignments</TabsTrigger> */}
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Resource Library
                </CardTitle>
                <CardDescription>Access helpful learning materials. (More coming soon!)</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  We are curating a collection of PDFs, links, and other useful resources.
                  Please check back later or ask your tutor for specific materials.
                </p>
                 {/* Example of a static link if needed for MVP
                <Button asChild className="mt-4">
                  <a href="/path/to/your/static-material.pdf" target="_blank" rel="noopener noreferrer">
                    Download Amharic Alphabet Chart
                  </a>
                </Button>
                */}
              </CardContent>
            </Card>
          </TabsContent>

           {/* MVP: Defer specific resource tabs
          <TabsContent value="flashcards">...</TabsContent>
          <TabsContent value="assignments">...</TabsContent>
          <TabsContent value="ai-tutor-chat">...</TabsContent>
          <TabsContent value="pronunciation-practice">...</TabsContent>
          */}
        </Tabs>
      </div>
    </div>
  )
}
