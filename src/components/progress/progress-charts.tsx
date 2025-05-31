"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltip, ChartTooltipContent, ChartStyle, ChartContainer, ChartConfig } from '@/components/ui/chart'; // Assuming ChartConfig is needed or defined in ui/chart

interface ProgressDataItem {
  name: string; // For XAxis dataKey
  value: number; // For Bar dataKey
  fill?: string; // Optional fill color for the bar
}

export interface ProgressData {
  labels: string[]; // Corresponds to XAxis categories
  datasets: {
    label: string; // Legend label
    data: number[]; // YAxis values
    backgroundColor?: string; // Used to derive `fill` for bars
    borderColor?: string;
  }[];
}

interface ProgressChartsProps {
  skillsData: ProgressData
  vocabularyData: ProgressData
  lessonData: ProgressData
}

export function ProgressCharts({ skillsData, vocabularyData, lessonData }: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState("3months")

  // Transform skillsData for Recharts BarChart
  const skillsChartData: ProgressDataItem[] = skillsData.labels.map((label, index) => ({
    name: label,
    value: skillsData.datasets[0]?.data[index] || 0,
    // Use a color from your theme, or derive from skillsData.datasets[0].backgroundColor
    // For simplicity, using a theme variable directly if available, or a fixed color.
    // Example: fill: 'hsl(var(--chart-1))'
    fill: `hsl(var(--chart-${(index % 5) + 1}))` // Cycle through chart colors
  }));

  const skillsChartConfig = skillsData.labels.reduce((acc, label, index) => {
    acc[label] = {
      label: label,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as ChartConfig);


  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Track your improvement over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="skills">
          <TabsList className="mb-6 grid w-full grid-cols-3">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            <ChartContainer config={skillsChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`}/>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                  />
                  <Bar dataKey="value" radius={4}>
                    {skillsChartData.map((entry, index) => (
                        <div key={`cell-${index}`} style={{ backgroundColor: entry.fill }} /> // Recharts needs Cells for individual bar colors if not using a single fill on <Bar>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {skillsData.labels.map((skill, index) => (
                <div key={skill} className="text-center p-3 bg-accent/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{skillsData.datasets[0]?.data[index] || 0}%</div>
                  <div className="text-sm text-muted-foreground">{skill}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-6">
            <div className="h-[300px] w-full">
              <div className="bg-muted/30 h-full rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Vocabulary acquisition chart would render here</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">Placeholder for Recharts Line Chart</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">247</div>
                <div className="text-sm text-muted-foreground">Words Learned</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-3xl font-bold text-secondary-foreground">85%</div>
                <div className="text-sm text-muted-foreground">Retention Rate</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            <div className="h-[300px] w-full">
              <div className="bg-muted/30 h-full rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Lesson completion chart would render here</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">Placeholder for Recharts Pie Chart</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">24</div>
                <div className="text-sm text-muted-foreground">Total Lessons</div>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <div className="text-3xl font-bold text-secondary-foreground">18.5</div>
                <div className="text-sm text-muted-foreground">Hours Learned</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-3xl font-bold text-accent-foreground">4.9</div>
                <div className="text-sm text-muted-foreground">Avg. Rating</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}