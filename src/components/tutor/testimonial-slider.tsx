
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Spinner } from "../ui/spinner";
import Image from "next/image";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  createdAt: any; // Firestore Timestamp
}

export function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      setIsLoading(true);
      try {
        const testimonialsCol = collection(db, "testimonials");
        const q = query(
          testimonialsCol, 
          where("status", "==", "approved"), 
          orderBy("createdAt", "desc"),
          limit(5) // Fetch latest 5 approved testimonials
        );
        const querySnapshot = await getDocs(q);
        const fetchedTestimonials = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
        setTestimonials(fetchedTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No testimonials yet. Be the first to share your experience!</p>
      </div>
    );
  }

  // For a real slider, you'd use a library like Swiper.js or Embla Carousel.
  // This is a simplified list view for now.
  return (
    <div className="space-y-8">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                {testimonial.imageUrl ? (
                  <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} data-ai-hint="student avatar"/>
                ) : (
                  <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground italic">&quot;{testimonial.comment}&quot;</p>
          </CardContent>
          {testimonial.imageUrl && (
             <CardFooter className="p-0">
                {/* Example of showing optional image, if provided */}
                {/* <Image src={testimonial.imageUrl} alt={`Testimonial by ${testimonial.name}`} width={600} height={400} className="w-full h-auto object-cover" /> */}
             </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
