
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <TriangleAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl">404 - Page Not Found</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Oops! The page you&apos;re looking for doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-8">
            It might have been moved, deleted, or you might have typed the address incorrectly. Let&apos;s get you back on track.
          </p>
          <Button asChild size="lg">
            <Link href="/">Go Back to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
