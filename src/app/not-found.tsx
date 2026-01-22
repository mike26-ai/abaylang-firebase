
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This is a separate client component for the main content to ensure proper hydration.
function NotFoundContent() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            {/* Using a simple text character to avoid SVG/icon hydration issues */}
            <span className="text-4xl text-destructive">!</span>
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

// The default export remains the page itself.
export default function NotFound() {
  return <NotFoundContent />;
}
