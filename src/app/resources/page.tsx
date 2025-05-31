
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Brain,
  FileText,
  Headphones,
  Play,
  Download,
  Star,
  Trophy,
  Zap,
  Volume2,
  MessageCircle,
  MicVocal,
  Loader2,
} from "lucide-react"
import { AIChatbot } from "@/components/ai/AIChatbot"
import { PronunciationFeedbackTool } from "@/components/ai/PronunciationFeedbackTool"
import { FlashcardPractice, type Flashcard } from "@/components/flashcards/FlashcardPractice"
import { HomeworkSubmission } from "@/components/homework/HomeworkSubmission"
import type { HomeworkAssignment, HomeworkSubmissionType } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "@/components/ui/spinner"

// Sample flashcards data (can be moved to Firestore later)
const flashcardsData: Flashcard[] = [
  {
    id: "1",
    amharic: "ሰላም",
    english: "Hello/Peace",
    pronunciation: "se-lam",
    category: "Greetings",
    difficulty: "beginner",
    example: "ሰላም! እንዴት ነህ? (Hello! How are you?)",
  },
  {
    id: "2",
    amharic: "አመሰግናለሁ",
    english: "Thank you",
    pronunciation: "a-me-seg-na-le-hu",
    category: "Common Phrases",
    difficulty: "beginner",
  },
  {
    id: "3",
    amharic: "ውሃ",
    english: "Water",
    pronunciation: "wu-ha",
    category: "Nouns",
    difficulty: "beginner",
  },
  {
    id: "4",
    amharic: "ቤተሰብ",
    english: "Family",
    pronunciation: "be-te-seb",
    category: "People",
    difficulty: "intermediate",
    example: "ይህ የኔ ቤተሰብ ነው። (This is my family.)",
  },
];


export default function ResourcesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [homeworkAssignments, setHomeworkAssignments] = useState<HomeworkAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const assignmentsCol = collection(db, "homeworkAssignments");
        const q = query(assignmentsCol, orderBy("dueDate", "asc")); // Order by due date
        const querySnapshot = await getDocs(q);
        const fetchedAssignments = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Firestore Timestamps need to be converted if used directly as Date objects,
            // but for dueDate string in component, it's fine if component handles string.
            // For now, assuming dueDate is a string in the format YYYY-MM-DD from Firestore or handled by component
            dueDate: (data.dueDate as Timestamp).toDate().toISOString().split('T')[0], // Convert Timestamp to YYYY-MM-DD string
          } as HomeworkAssignment;
        });
        setHomeworkAssignments(fetchedAssignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Could not fetch homework assignments.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [toast]);

  const handleSubmitAssignment = async (
    assignmentId: string,
    submission: { text: string; files: File[] } // Files part is for future
  ): Promise<void> => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to submit homework.", variant: "destructive" });
      return;
    }

    try {
      const submissionData: Omit<HomeworkSubmissionType, 'id'> = {
        assignmentId: assignmentId,
        userId: user.uid,
        userName: user.displayName || "Anonymous User",
        userEmail: user.email || "",
        submissionText: submission.text,
        // fileURLs: [], // For future file uploads
        submittedAt: serverTimestamp() as Timestamp, // Cast for type consistency before saving
        status: "submitted",
      };
      await addDoc(collection(db, "homeworkSubmissions"), submissionData);

      toast({
        title: "Homework Submitted!",
        description: "Your assignment has been successfully submitted.",
      });

      // Update local state for immediate UI feedback
      setHomeworkAssignments(prevAssignments =>
        prevAssignments.map(asmnt =>
          asmnt.id === assignmentId ? { ...asmnt, status: "submitted" } : asmnt
        )
      );

    } catch (error) {
      console.error("Error submitting homework:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your homework. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the component know
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Learning Resources</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Interactive tools and materials to accelerate your Amharic learning journey
          </p>
        </div>

        <Tabs defaultValue="flashcards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7 bg-card border">
            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Flashcards
            </TabsTrigger>
            <TabsTrigger
              value="quizzes"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="flipbooks"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Flipbooks
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Audio
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Assignments
            </TabsTrigger>
             <TabsTrigger
              value="ai-tutor-chat"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              AI Tutor
            </TabsTrigger>
            <TabsTrigger
              value="pronunciation-practice"
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              Pronunciation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flashcards" className="space-y-6">
            <FlashcardPractice cards={flashcardsData} />
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="w-5 h-5 text-primary" />
                  Interactive Quizzes
                </CardTitle>
                <CardDescription>Test your knowledge with fun quizzes (coming soon).</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Quizzes are being developed. Check back soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flipbooks" className="space-y-6">
            <Card className="shadow-xl">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Digital Flipbooks
                  </CardTitle>
                  <CardDescription>Interactive learning materials (coming soon).</CardDescription>
                </CardHeader>
               <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Flipbooks feature coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card className="shadow-xl">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Headphones className="w-5 h-5 text-primary" />
                    Audio Resources
                  </CardTitle>
                  <CardDescription>Listening practice and pronunciation guides (coming soon).</CardDescription>
                </CardHeader>
              <CardContent className="text-center py-12">
                <Headphones className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Audio resources coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {isLoadingAssignments ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
                <p className="ml-3 text-muted-foreground">Loading assignments...</p>
              </div>
            ) : homeworkAssignments.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assignments posted at the moment. Check back later!</p>
                </CardContent>
              </Card>
            ) : (
              homeworkAssignments.map((assignment) => (
                <HomeworkSubmission
                  key={assignment.id}
                  assignment={assignment}
                  onSubmit={handleSubmitAssignment}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="ai-tutor-chat">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  AI Tutor Chat (Beta)
                </CardTitle>
                <CardDescription>Practice your conversation skills with our AI tutor.</CardDescription>
              </CardHeader>
              <CardContent>
                <AIChatbot />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pronunciation-practice">
             <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MicVocal className="w-5 h-5 text-primary" />
                  Pronunciation Practice (Beta)
                </CardTitle>
                <CardDescription>Get feedback on your Amharic pronunciation.</CardDescription>
              </CardHeader>
              <CardContent>
                <PronunciationFeedbackTool />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
