
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, Video, MessageSquare, Star, Clock, Users } from "lucide-react";
import { tutorInfo } from "@/config/site";

export function TutorProfileCard() {
  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="w-full shadow-xl overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 relative min-h-[250px] md:min-h-full bg-accent flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
          {/* Placeholder Div with Initials */}
          <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-5xl font-bold text-primary">{getInitials(tutorInfo.name)}</span>
          </div>
        </div>
        <div className="md:w-2/3">
          <CardHeader className="p-6">
            <CardTitle className="text-3xl font-bold">{tutorInfo.name}</CardTitle>
            <CardDescription className="text-md text-primary">{tutorInfo.shortIntro}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border-b pb-6">
                <div className="p-2 rounded-lg">
                    <Star className="mx-auto h-6 w-6 text-yellow-500 mb-1"/>
                    <p className="font-semibold text-sm text-foreground">5-Star Rated</p>
                    <p className="text-xs text-muted-foreground">On major learning platforms</p>
                </div>
                <div className="p-2 rounded-lg">
                    <Clock className="mx-auto h-6 w-6 text-primary mb-1"/>
                    <p className="font-semibold text-sm text-foreground">1,000+ Hours</p>
                    <p className="text-xs text-muted-foreground">Of lessons taught</p>
                </div>
                <div className="p-2 rounded-lg">
                    <Users className="mx-auto h-6 w-6 text-blue-500 mb-1"/>
                    <p className="font-semibold text-sm text-foreground">200+ Students</p>
                    <p className="text-xs text-muted-foreground">From around the world</p>
                </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">About Me</h4>
              <p className="text-muted-foreground leading-relaxed">{tutorInfo.bio}</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-2">Teaching Style</h4>
              <p className="text-muted-foreground leading-relaxed">{tutorInfo.teachingStyle}</p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Services Offered</h4>
              <ul className="space-y-1 text-muted-foreground">
                {tutorInfo.services.map((service, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
            
            {tutorInfo.videoUrl && (
              <div className="mt-6">
                 <h4 className="font-semibold text-lg mb-3">Intro Video</h4>
                <div className="aspect-video rounded-lg overflow-hidden border">
                   {/* In a real scenario, use a proper video player or iframe for YouTube */}
                   <div className="bg-muted w-full h-full flex items-center justify-center">
                     <a href={tutorInfo.videoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-primary hover:text-primary/80">
                       <Video className="h-12 w-12 mb-2" />
                       <span className="font-medium">Watch Introduction on YouTube</span>
                     </a>
                   </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="hover-lift">
                <Link href="/bookings">Book a Lesson</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover-lift">
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact {tutorInfo.name.split(" ")[0]}
                </Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
