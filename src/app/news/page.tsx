
"use client"

import type { Metadata } from 'next'; // Added Metadata import
import { Newspaper } from 'lucide-react'; // Added icon import

// export const metadata: Metadata = { // Static metadata example
//   title: 'News & Updates - LissanHub',
//   description: 'Stay updated with the latest news and announcements from LissanHub.',
// };

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                <Newspaper className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                News & Updates
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                This section is coming soon! Stay tuned for the latest news, announcements, and developments from LissanHub.
            </p>
        </header>
        {/* Placeholder for future news items */}
         <div className="text-center">
            {/* <img src="https://placehold.co/600x400.png?text=News+Coming+Soon" alt="News coming soon" className="mx-auto rounded-lg shadow-md" /> */}
        </div>
      </div>
    </div>
  )
}
