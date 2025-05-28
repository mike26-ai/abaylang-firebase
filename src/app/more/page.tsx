
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, BookText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'More from LissanHub',
  description: 'Discover more resources, news, and blog posts from LissanHub.',
};

export default function MorePage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Explore More
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover more news, updates, and learning resources from LissanHub.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Card className="shadow-xl hover-lift transition-transform duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">News & Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Stay updated with the latest announcements, new features, and developments from the LissanHub community.
            </p>
            <Button asChild className="w-full">
              <Link href="/news">View News</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-xl hover-lift transition-transform duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <BookText className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Learning Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Dive into articles with insights, tips, and stories to help you master Amharic and connect with Ethiopian culture.
            </p>
            <Button asChild className="w-full">
              <Link href="/blog">Read Blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
