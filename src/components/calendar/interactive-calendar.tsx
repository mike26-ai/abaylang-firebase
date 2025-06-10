
"use client";

import * as React from "react";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, type CalendarProps } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define the lesson type expected by this component, matching src/app/profile/page.tsx
export interface CalendarLesson {
  id: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  status: "booked" | "completed" | "cancelled";
}

interface InteractiveCalendarProps {
  lessons: CalendarLesson[];
  onSelectDate: (date: Date) => void;
  onSelectLesson: (lesson: CalendarLesson) => void;
  initialSelectedDate?: Date;
}

export function InteractiveCalendar({
  lessons,
  onSelectDate,
  onSelectLesson,
  initialSelectedDate,
}: InteractiveCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialSelectedDate || new Date()
  );

  const lessonsOnSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [];
    return lessons.filter((lesson) => isSameDay(lesson.date, selectedDate));
  }, [selectedDate, lessons]);

  const lessonDays = React.useMemo(() => {
    return lessons.map((lesson) => lesson.date);
  }, [lessons]);

  const handleDateChange: CalendarProps["onSelect"] = (day, selectedDay, activeModifiers) => {
    if (day) {
      setSelectedDate(day);
      onSelectDate(day);
    }
  };

  const getStatusIcon = (status: CalendarLesson["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "booked":
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };


  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      <Card className="shadow-md">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            className="rounded-md"
            modifiers={{
              hasLesson: lessonDays,
            }}
            modifiersStyles={{
              hasLesson: {
                fontWeight: 'bold',
                textDecoration: 'underline',
                textDecorationColor: 'hsl(var(--primary))',
                textDecorationThickness: '2px',
                textUnderlineOffset: '3px',
               },
            }}
            components={{
                DayContent: (props) => {
                    const originalDayContent = <div className="react-datepicker-day-content">{format(props.date, "d")}</div>;
                    const lessonsForThisDay = lessons.filter(lesson => isSameDay(lesson.date, props.date));
                    if (lessonsForThisDay.length > 0) {
                        return (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {originalDayContent}
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                                  {lessonsForThisDay.slice(0,3).map(lesson => (
                                      <span key={lesson.id} className={cn(
                                          "h-1 w-1 rounded-full",
                                          lesson.status === "booked" && "bg-blue-500",
                                          lesson.status === "completed" && "bg-green-500",
                                          lesson.status === "cancelled" && "bg-destructive"
                                      )}></span>
                                  ))}
                                </div>
                            </div>
                        );
                    }
                    return originalDayContent;
                }
            }}
          />
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">
            Lessons on {selectedDate ? format(selectedDate, "PPP") : "N/A"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lessonsOnSelectedDate.length > 0 ? (
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {lessonsOnSelectedDate.map((lesson) => (
                <li
                  key={lesson.id}
                  className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => onSelectLesson(lesson)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{lesson.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {lesson.time} ({lesson.duration} min)
                      </p>
                    </div>
                    <Badge variant={
                      lesson.status === 'completed' ? 'default' :
                      lesson.status === 'cancelled' ? 'destructive' :
                      'secondary'
                    } className="capitalize flex items-center gap-1">
                      {getStatusIcon(lesson.status)}
                      {lesson.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No lessons scheduled for this day.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
