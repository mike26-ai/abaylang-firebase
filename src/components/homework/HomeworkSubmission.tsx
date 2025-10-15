
"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileUp, Paperclip, Send, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner" // Added Spinner
import type { HomeworkAssignment } from "@/lib/types"; // Use type from central location

interface HomeworkSubmissionProps {
  assignment: HomeworkAssignment // Use the imported type
  onSubmit: (assignmentId: string, submission: { text: string; files: File[] }) => Promise<void>
}

export function HomeworkSubmission({ assignment, onSubmit }: HomeworkSubmissionProps) {
  const [submissionText, setSubmissionText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async () => {
    if (!submissionText.trim() && files.length === 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(assignment.id, { text: submissionText, files })
      // Form reset is handled by parent component potentially changing assignment status
      // setSubmissionText("")
      // setFiles([])
    } catch (error) {
      console.error("Error submitting homework:", error)
      // Error toast might be handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Ensure dueDate is treated as a string 'YYYY-MM-DD' or a Date object consistently.
  // If it's a Firestore Timestamp from props, it should be converted to Date or string before comparison.
  // For this component, assuming `assignment.dueDate` is a string like 'YYYY-MM-DD' or already a Date object.
  // If it's a Timestamp string, new Date(timestampStr) is okay. If it's Firestore Timestamp obj, use .toDate().
  const dueDateObject = typeof assignment.dueDate === 'string' ? new Date(assignment.dueDate) : (assignment.dueDate as any).toDate ? (assignment.dueDate as any).toDate() : new Date();
  const isOverdue = dueDateObject < new Date() && assignment.status === "pending";
  
  const daysDifference = () => {
    const today = new Date();
    today.setHours(0,0,0,0); // Normalize today to start of day
    const due = new Date(dueDateObject);
    due.setHours(0,0,0,0); // Normalize due date to start of day
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  const daysDiff = daysDifference();


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{assignment.title}</CardTitle>
            <CardDescription>Due: {new Date(dueDateObject).toLocaleDateString()}</CardDescription>
          </div>
          <Badge
            className={cn(
              "text-xs px-2 py-1",
              assignment.status === "submitted" && "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
              assignment.status === "graded" && "bg-primary/10 text-primary border-primary/20",
              assignment.status === "pending" && !isOverdue && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20",
              (assignment.status === "late" || (assignment.status === "pending" && isOverdue)) && "bg-destructive/10 text-destructive border-destructive/20",
            )}
          >
            {assignment.status === "pending" && isOverdue ? "Overdue" : assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted/50 rounded-lg text-sm">
          <p className="text-muted-foreground">{assignment.description}</p>
        </div>

        {(assignment.status === "graded" || assignment.status === "submitted") && (
          <div className="flex justify-end">
            <Button variant="link" onClick={() => setShowFeedback(!showFeedback)} className="text-primary hover:text-primary/80 px-0">
              {showFeedback ? "Hide Feedback" : "Show Feedback"}
            </Button>
          </div>
        )}

        {showFeedback && assignment.status === "graded" && (assignment.feedback || assignment.grade) && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Tutor Feedback</h4>
                {assignment.feedback && <p className="text-muted-foreground text-sm mb-2 whitespace-pre-wrap">{assignment.feedback}</p>}
                {assignment.grade && (
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-muted-foreground mr-2">Grade:</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20">{assignment.grade}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
         {assignment.status === "submitted" && !showFeedback && !assignment.feedback && (
            <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10 text-center">
                <p className="text-sm text-blue-700 dark:text-blue-400">Your assignment has been submitted and is awaiting feedback.</p>
            </div>
        )}


        {assignment.status === "pending" && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`submission-${assignment.id}`}>Your Answer</Label>
              <Textarea
                id={`submission-${assignment.id}`}
                placeholder="Type your answer here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`files-${assignment.id}`}>Attachments (optional, feature coming soon)</Label>
              <div className="flex items-center gap-2">
                <Input id={`files-${assignment.id}`} type="file" multiple onChange={handleFileChange} className="hidden" disabled/>
                <Label
                  htmlFor={`files-${assignment.id}`}
                  className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-not-allowed hover:bg-muted/70 text-muted-foreground opacity-50"
                >
                  <Paperclip className="w-4 h-4" />
                  <span>Choose Files (Disabled)</span>
                </Label>
                {files.length > 0 && <span className="text-sm text-muted-foreground">{files.length} file(s) selected</span>}
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Selected Files:</p>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileUp className="w-4 h-4" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {assignment.status === "pending" && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-3">
            <div className="flex items-center gap-1 text-sm">
              {isOverdue ? (
                <div className="flex items-center text-destructive">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Overdue by {Math.abs(daysDiff)} day{Math.abs(daysDiff) !== 1 ? 's' : ''}
                </div>
              ) : (
                <div className="flex items-center text-yellow-600 dark:text-yellow-500">
                  <Clock className="w-4 h-4 mr-1" />
                   {daysDiff < 0 ? `Overdue` : daysDiff === 0 ? `Due today` : `Due in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`}
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!submissionText.trim() && files.length === 0)}
            >
              {isSubmitting ? (
                <Spinner size="sm" className="mr-2"/>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
