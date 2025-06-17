
import { LessonMaterialManager } from "@/components/admin/lesson-material-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: 'Manage Materials - Admin',
  description: 'Upload and manage lesson materials like documents, videos, and audio.',
};

export default function AdminMaterialsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-7 w-7 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Lesson Materials</h1>
            <p className="text-muted-foreground">Upload, organize, and share learning resources with students.</p>
        </div>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
          <CardDescription>A list of all uploaded documents, videos, audio files, and interactive links.</CardDescription>
        </CardHeader>
        <CardContent>
          <LessonMaterialManager />
        </CardContent>
      </Card>
    </div>
  );
}
