
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, TrendingUp, MessageSquare, ThumbsUp, Award, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import type { Testimonial as TestimonialType } from "@/lib/types";
import { format } from "date-fns";

// Helper to generate initials
const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};


export default function ReviewsPage() {
  const [allReviews, setAllReviews] = useState<TestimonialType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const { toast } = useToast();

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const testimonialsCol = collection(db, "testimonials");
        // This query requires a composite index on 'status' (ASC) and 'createdAt' (DESC)
        // If missing, Firestore will error. Check browser console for a link to create it.
        const q = query(
          testimonialsCol,
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedTestimonials = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            rating: data.rating,
            comment: data.comment,
            location: data.location,
            status: data.status,
            createdAt: data.createdAt,
            // Fields from new Review design, assign defaults or map if available
            studentInitials: getInitials(data.name), // Generate initials
            lessonType: data.lessonType || "General Lesson", // Default if not present
            specificRatings: data.specificRatings || { teachingQuality: 0, materialClarity: 0, culturalInsights: 0, pacing: 0, engagement: 0 },
            helpful: data.helpful || 0,
            verified: true, // All approved testimonials are considered verified
            date: data.createdAt ? format(data.createdAt.toDate(), "yyyy-MM-dd") : "Date not available",
          } as TestimonialType;
        });
        setAllReviews(fetchedTestimonials);
      } catch (error: any) {
        console.error("Error fetching testimonials:", error);
        let description = "Could not fetch reviews.";
        if (error.code === 'failed-precondition') {
            description = "Could not fetch reviews. This often means a required database index is missing (e.g., for testimonials: status ASC, createdAt DESC). Please check the browser console for a link to create it, or check Firestore indexes.";
        } else if (error.code === 'permission-denied') {
            description = "Could not fetch reviews due to a permission issue. Please check Firestore security rules for 'testimonials'.";
        }
        toast({
          title: "Error Fetching Reviews",
          description: description,
          variant: "destructive",
          duration: 9000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [toast]);


  const filteredReviews = allReviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.lessonType && review.lessonType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating
    return matchesSearch && matchesRating
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      case "oldest":
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      case "highest":
        return b.rating - a.rating
      case "lowest":
        return a.rating - b.rating
      case "helpful":
        return (b.helpful || 0) - (a.helpful || 0)
      default:
        return 0
    }
  })

  const averageRating = allReviews.length > 0 ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: allReviews.filter((r) => r.rating === rating).length,
    percentage: allReviews.length > 0 ? (allReviews.filter((r) => r.rating === rating).length / allReviews.length) * 100 : 0,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Student Reviews & Ratings</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what students are saying about their Amharic learning experience with Mahir
          </p>
        </div>

        {/* Rating Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">Based on {allReviews.length} reviews</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <h3 className="font-semibold text-foreground mb-4">Rating Distribution</h3>
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <h3 className="font-semibold text-foreground mb-4">Key Highlights</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">100% Verified Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">95% 5-Star Ratings</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Detailed Feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Highly Recommended</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {isLoading ? (
           <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : sortedReviews.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-primary/70 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">No Reviews Match Your Criteria</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search or filter settings, or check back later for new reviews.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((review) => (
              <Card key={review.id} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-semibold text-primary">
                      {review.studentInitials}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                        <div className="mb-2 sm:mb-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{review.name}</h3>
                            {review.verified && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Verified Student</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{review.lessonType}</span>
                            {review.date && <><span>•</span> <span>{format(new Date(review.date), 'PP')}</span></>}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">{review.helpful || 0} found helpful</div>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>

                      {review.specificRatings && Object.keys(review.specificRatings).length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                          {Object.entries(review.specificRatings).map(([key, ratingValue]) => {
                            const rating = typeof ratingValue === 'number' ? ratingValue : 0;
                            return(
                            <div key={key} className="text-center p-2 bg-muted/50 rounded-md">
                              <div className="text-xs text-muted-foreground mb-1 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="flex items-center justify-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )})}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Helpful ({review.helpful || 0})
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="shadow-xl mt-12 bg-gradient-to-r from-primary/5 to-accent/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Your Journey?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of satisfied students who are reconnecting with their Ethiopian heritage through Amharic
              language learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/bookings">
                <Button>Book Your First Lesson</Button>
              </Link>
              {/* Link to submit testimonial - current page is for viewing. If form is added here, can scroll.
                  Otherwise, a separate /submit-testimonial page might be needed, or integrate form here.
                  For now, keeping it as is to point to itself, assuming form might be added later or it's a general CTA.
              */}
              <Link href="/testimonials"> 
                <Button variant="outline">Share Your Experience</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

