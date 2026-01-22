

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Lock, Play, BookOpen, Award, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface LearningModule {
  id: string
  title: string
  description: string
  status: "completed" | "in-progress" | "locked"
  progress: number
  lessons: {
    id: string
    title: string
    type: "video" | "interactive" | "quiz" | "reading"
    duration: number
    status: "completed" | "in-progress" | "not-started" | "locked"
  }[]
}

interface LearningPathProps {
  modules: LearningModule[]
  onSelectLesson: (moduleId: string, lessonId: string) => void
}

export function LearningPath({ modules, onSelectLesson }: LearningPathProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(
    modules.find((m) => m.status === "in-progress")?.id || modules[0]?.id || null,
  )

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId)
  }

  return (
    <Card className="shadow-lg border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-primary" />
          Your Learning Path
        </CardTitle>
        <CardDescription>Track your progress through the Amharic curriculum</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {modules.map((module) => (
          <div key={module.id} className="border border-border rounded-lg overflow-hidden">
            <div
              className={cn(
                "flex items-center justify-between p-4 cursor-pointer",
                module.status === "completed"
                  ? "bg-primary/5 hover:bg-primary/10"
                  : module.status === "in-progress"
                    ? "bg-secondary/5 hover:bg-secondary/10"
                    : "bg-muted/50 hover:bg-muted/70",
              )}
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    module.status === "completed"
                      ? "bg-primary/10 text-primary"
                      : module.status === "in-progress"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {module.status === "completed" ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : module.status === "locked" ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{module.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-muted rounded-full">
                      <div
                        className={cn(
                          "h-1.5 rounded-full",
                          module.status === "completed"
                            ? "bg-primary"
                            : module.status === "in-progress"
                              ? "bg-secondary"
                              : "bg-muted-foreground/30",
                        )}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{module.progress}% complete</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    module.status === "completed" ? "default"
                    : module.status === "in-progress" ? "secondary"
                    : "outline"
                  }
                  className={cn(
                     module.status === "completed" && "bg-primary/10 text-primary border-primary/20",
                     module.status === "in-progress" && "bg-secondary/10 text-secondary border-secondary/20",
                     module.status === "locked" && "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {module.status === "completed"
                    ? "Completed"
                    : module.status === "in-progress"
                      ? "In Progress"
                      : "Locked"}
                </Badge>
                <ChevronRight
                  className={cn("w-5 h-5 text-muted-foreground transition-transform", expandedModule === module.id ? "rotate-90" : "")}
                />
              </div>
            </div>

            {expandedModule === module.id && (
              <div className="p-4 border-t border-border">
                <div className="space-y-2">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        lesson.status === "completed"
                          ? "bg-primary/5"
                          : lesson.status === "in-progress"
                            ? "bg-secondary/5"
                            : lesson.status === "locked"
                              ? "bg-muted/50 opacity-60 cursor-not-allowed"
                              : "bg-card border border-border hover:bg-accent/50",
                        lesson.status !== "locked" && "cursor-pointer"
                      )}
                      onClick={() => lesson.status !== "locked" && onSelectLesson(module.id, lesson.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                            lesson.type === "video"
                              ? "bg-primary/10 text-primary"
                              : lesson.type === "interactive"
                                ? "bg-accent text-accent-foreground"
                                : lesson.type === "quiz"
                                  ? "bg-chart-3/20 text-chart-3" // Using a chart color for variety
                                  : "bg-secondary/10 text-secondary", // Reading type
                          )}
                        >
                          {lesson.status === "completed" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : lesson.status === "locked" ? (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{lesson.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-border">
                              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={lesson.status === "locked" ? "outline" : "default"}
                        disabled={lesson.status === "locked"}
                        className={cn(lesson.status !== "locked" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "border-border text-muted-foreground")}
                        onClick={(e) => {
                           if(lesson.status !== "locked") {
                             e.stopPropagation(); // Prevent outer div onClick if button is active
                             onSelectLesson(module.id, lesson.id);
                           }
                        }}
                      >
                        {lesson.status === "completed"
                          ? "Review"
                          : lesson.status === "in-progress"
                            ? "Continue"
                            : lesson.status === "locked"
                              ? "Locked"
                              : "Start"}
                      </Button>
                    </div>
                  ))}
                </div>

                {module.status === "completed" && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Module completed! You&apos;ve earned a certificate.
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                      View Certificate
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
