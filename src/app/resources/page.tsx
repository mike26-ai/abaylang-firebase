
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  RotateCcw,
  MessageCircle, // For AI Chatbot
  MicVocal, // For Pronunciation
} from "lucide-react"
import { AIChatbot } from "@/components/ai/AIChatbot"
import { PronunciationFeedbackTool } from "@/components/ai/PronunciationFeedbackTool"

export default function ResourcesPage() {
  const [currentCard, setCurrentCard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const flashcards = [
    { amharic: "ሰላም", english: "Hello/Peace", pronunciation: "selam" },
    { amharic: "እንዴት ነሽ?", english: "How are you? (to female)", pronunciation: "indet nesh?" },
    { amharic: "አመሰግናለሁ", english: "Thank you", pronunciation: "ameseginalew" },
    { amharic: "እንደምን አደርሽ?", english: "How are you doing? (to female)", pronunciation: "indemin adersh?" },
  ]

  // quizQuestions is not used in the current JSX, keeping it for potential future use
  // const quizQuestions = [
  //   {
  //     question: "What does 'ሰላም' mean?",
  //     options: ["Goodbye", "Hello/Peace", "Thank you", "Please"],
  //     correct: 1,
  //   },
  //   {
  //     question: "How do you say 'Thank you' in Amharic?",
  //     options: ["ሰላም", "አመሰግናለሁ", "እንዴት ነሽ", "እንደምን አደርሽ"],
  //     correct: 1,
  //   },
  // ]

  const flipCard = () => {
    setShowAnswer(!showAnswer)
  }

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length)
    setShowAnswer(false)
  }

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    setShowAnswer(false)
  }

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

          {/* Interactive Flashcards */}
          <TabsContent value="flashcards" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-xl">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-foreground">
                      <Zap className="w-5 h-5 text-primary" />
                      Interactive Flashcards
                    </CardTitle>
                    <CardDescription>
                      Card {currentCard + 1} of {flashcards.length} • Basic Greetings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div
                        className="aspect-[3/2] bg-gradient-to-br from-accent/70 to-accent rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg"
                        onClick={flipCard}
                      >
                        <div className="text-center">
                          {!showAnswer ? (
                            <>
                              <div className="text-4xl font-bold text-accent-foreground mb-4">
                                {flashcards[currentCard].amharic}
                              </div>
                              <div className="text-primary text-sm">Click to reveal answer</div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-accent-foreground mb-2">
                                {flashcards[currentCard].english}
                              </div>
                              <div className="text-primary text-lg mb-2">
                                /{flashcards[currentCard].pronunciation}/
                              </div>
                              <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
                                <Volume2 className="w-4 h-4 mr-1" />
                                Listen
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button onClick={prevCard} variant="outline" className="border-primary/30 hover:bg-primary/10">
                          Previous
                        </Button>
                        <Button onClick={flipCard} variant="outline" className="border-primary/30 hover:bg-primary/10">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Flip Card
                        </Button>
                        <Button onClick={nextCard} variant="outline" className="border-primary/30 hover:bg-primary/10">
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">247</div>
                      <div className="text-sm text-muted-foreground">Words Mastered</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Today's Goal</span>
                        <span className="text-foreground">12/15</span>
                      </div>
                      <Progress value={80} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <div className="text-lg font-bold text-primary">5</div>
                        <div className="text-xs text-muted-foreground">Day Streak</div>
                      </div>
                       <div className="p-3 bg-accent/30 rounded-lg">
                        <div className="text-lg font-bold text-primary">92%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg text-foreground">Flashcard Sets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="font-medium text-foreground">Basic Greetings</div>
                      <div className="text-sm text-muted-foreground">20 cards • 95% mastered</div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="font-medium text-foreground">Family Members</div>
                      <div className="text-sm text-muted-foreground">15 cards • 80% mastered</div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="font-medium text-foreground">Food & Dining</div>
                      <div className="text-sm text-muted-foreground">25 cards • 60% mastered</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Interactive Quizzes */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Brain className="w-5 h-5 text-primary" />
                    Quick Quiz: Basic Greetings
                  </CardTitle>
                  <CardDescription>Test your knowledge with 5 quick questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">1/5 questions</span>
                    </div>
                    <Progress value={20} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">What does 'ሰላም' mean?</h3>
                    <div className="space-y-2">
                      {["Goodbye", "Hello/Peace", "Thank you", "Please"].map((option, index) => (
                        <button
                          key={index}
                          className="w-full p-3 text-left border rounded-lg hover:bg-accent/50 transition-colors text-foreground"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 border-primary/30 hover:bg-primary/10">
                      Skip Question
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Next Question</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">Available Quizzes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Basic Vocabulary</h4>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">10 questions • 5 min</div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">Score: 95%</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Family & Relationships</h4>
                         <Badge variant="default" className="bg-accent text-accent-foreground">New</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">15 questions • 8 min</div>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Cultural Knowledge</h4>
                        <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-500">In Progress</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">20 questions • 12 min</div>
                      <Progress value={60} className="h-1 bg-primary/20 [&>div]:bg-primary" />
                    </div>
                  </CardContent>
                </Card>

                 <Card className="shadow-xl bg-gradient-to-br from-accent/50 to-accent/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Trophy className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Quiz Champion</h3>
                        <p className="text-sm text-muted-foreground">Complete 5 quizzes to unlock</p>
                      </div>
                    </div>
                    <Progress value={60} className="h-2 mb-2 bg-primary/20 [&>div]:bg-primary" />
                    <div className="text-xs text-muted-foreground">3/5 quizzes completed</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Digital Flipbooks */}
          <TabsContent value="flipbooks" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                   <div className="aspect-[3/4] bg-gradient-to-br from-accent/70 to-accent/90 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Amharic Alphabet Guide</CardTitle>
                  <CardDescription>Interactive guide to the Fidel script with audio pronunciation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">24/33 letters</span>
                    </div>
                    <Progress value={73} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                   <div className="aspect-[3/4] bg-gradient-to-br from-accent/50 to-accent/30 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Ethiopian Culture & Traditions</CardTitle>
                  <CardDescription>Explore the rich cultural heritage of Ethiopia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="default" className="bg-primary text-primary-foreground">New Release</Badge>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="w-4 h-4 mr-2" />
                      Start Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                   <div className="aspect-[3/4] bg-gradient-to-br from-secondary/20 to-secondary/40 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-16 h-16 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">Common Phrases Handbook</CardTitle>
                  <CardDescription>Essential phrases for everyday conversations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">12/20 chapters</span>
                    </div>
                    <Progress value={60} className="h-2 bg-secondary/30 [&>div]:bg-secondary" />
                    <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audio Resources */}
          <TabsContent value="audio" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Headphones className="w-5 h-5 text-primary" />
                    Pronunciation Practice
                  </CardTitle>
                  <CardDescription>Listen and repeat to perfect your pronunciation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">Basic Greetings</h4>
                        <p className="text-sm text-muted-foreground">5 audio clips</p>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress value={80} className="h-1 bg-primary/20 [&>div]:bg-primary" />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">Numbers 1-20</h4>
                        <p className="text-sm text-muted-foreground">20 audio clips</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress value={45} className="h-1 bg-primary/20 [&>div]:bg-primary" />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">Family Members</h4>
                        <p className="text-sm text-muted-foreground">12 audio clips</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                    <Progress value={0} className="h-1 bg-primary/20 [&>div]:bg-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Cultural Stories & Proverbs</CardTitle>
                  <CardDescription>Listen to traditional Ethiopian stories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">The Lion and the Mouse</h4>
                        <p className="text-sm text-muted-foreground">Traditional fable • 8 min</p>
                      </div>
                    </div>
                  </div>
                   <div className="p-4 border rounded-lg hover:bg-accent/30 cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-accent/80 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Ethiopian Proverbs</h4>
                        <p className="text-sm text-muted-foreground">Wisdom sayings • 12 min</p>
                      </div>
                    </div>
                  </div>
                   <div className="p-4 border rounded-lg hover:bg-secondary/10 cursor-pointer">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Coffee Ceremony Story</h4>
                        <p className="text-sm text-muted-foreground">Cultural tradition • 6 min</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Assignments */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <FileText className="w-5 h-5 text-primary" />
                      Current Assignments
                    </CardTitle>
                    <CardDescription>Complete your homework and track your progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg border-l-4 border-l-yellow-400 dark:border-l-yellow-600">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Family Conversation Practice</h4>
                        <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-500">Due Tomorrow</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Record a 3-minute conversation with a family member using the phrases learned in lesson 5.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          Start Assignment
                        </Button>
                        <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10">
                          <Download className="w-4 h-4 mr-1" />
                          Download Guide
                        </Button>
                      </div>
                    </div>

                     <div className="p-4 border rounded-lg border-l-4 border-l-primary/50 dark:border-l-primary">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Fidel Script Writing Exercise</h4>
                        <Badge variant="default" className="bg-accent text-accent-foreground">In Progress</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Practice writing your name and family members' names in Fidel script.
                      </p>
                      <div className="mb-3">
                        <Progress value={60} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                        <div className="text-xs text-muted-foreground mt-1">6/10 exercises completed</div>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Continue Assignment
                      </Button>
                    </div>

                     <div className="p-4 border rounded-lg border-l-4 border-l-green-400 dark:border-l-green-600"> {/* Using green for completed */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Cultural Research Project</h4>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Write a short essay about an Ethiopian cultural tradition that interests you.
                      </p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">Grade: 95% - Excellent work!</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">Assignment Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-accent/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">8</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                       <div className="text-center p-3 bg-yellow-400/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-500">2</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="text-foreground">80%</span>
                      </div>
                      <Progress value={80} className="h-2 bg-primary/20 [&>div]:bg-primary" />
                    </div>
                     <div className="text-center p-3 bg-accent/30 rounded-lg">
                      <div className="text-lg font-bold text-primary">92%</div>
                      <div className="text-sm text-muted-foreground">Average Grade</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl bg-gradient-to-br from-accent/50 to-accent/30">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2 text-foreground">Assignment Ace</h3>
                      <p className="text-sm text-muted-foreground mb-3">Complete 10 assignments with 90%+ grades</p>
                      <Progress value={80} className="h-2 mb-2 bg-primary/20 [&>div]:bg-primary" />
                      <div className="text-xs text-muted-foreground">8/10 assignments completed</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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

