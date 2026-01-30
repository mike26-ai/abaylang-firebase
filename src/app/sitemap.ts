
import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://abylang.com';

  // List of static pages to include in the sitemap
  const staticRoutes = [
    '/',
    '/tutor-profile',
    '/packages',
    '/group-sessions',
    '/bookings',
    '/testimonials',
    '/resources',
    '/flashcards',
    '/accent-improvement',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/more',
    '/login',
    '/register'
  ];

  // Map over the static routes to create sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));

  // In the future, you could add dynamic routes here.
  // For example, if you add a blog, you would fetch all blog post slugs
  // and add them to the sitemapEntries array.
 
  return sitemapEntries;
}
