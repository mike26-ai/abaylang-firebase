
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db, auth as firebaseAuth } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { updateProfile as updateFirebaseUserProfile } from "firebase/auth";
import type { UserProfile } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";


export default function ProfileSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    nativeLanguage: "",
    country: "",
    amharicLevel: "",
  });
  
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        setIsLoadingProfile(false);
        return;
    };

    const fetchUserProfile = async () => {
        setIsLoadingProfile(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profile = userDocSnap.data() as UserProfile;
          setUserProfileData(profile);
          setEditFormData({
              name: profile.name || user.displayName || "",
              nativeLanguage: profile.nativeLanguage || "",
              country: profile.country || "",
              amharicLevel: profile.amharicLevel || "beginner",
          });
        }
        setIsLoadingProfile(false);
    }
    fetchUserProfile();
  }, [user, authLoading]);


  const handleProfileEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleProfileSelectChange = (name: string, value: string) => {
     setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firebaseAuth.currentUser) return; 
    
    setIsLoadingProfile(true); 
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedProfileData = {
        name: editFormData.name,
        nativeLanguage: editFormData.nativeLanguage,
        country: editFormData.country,
        amharicLevel: editFormData.amharicLevel,
      };
      await updateDoc(userDocRef, updatedProfileData);

      if (firebaseAuth.currentUser.displayName !== editFormData.name) {
        await updateFirebaseUserProfile(firebaseAuth.currentUser, { displayName: editFormData.name });
      }
      
      setUserProfileData(prev => ({ ...prev, ...updatedProfileData } as UserProfile));

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
    const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">View and manage your account details.</p>
        </header>

         {isLoadingProfile ? (
            <div className="flex justify-center items-center h-64"><Spinner size="lg"/></div>
         ): userProfileData ? (
            <Card className="shadow-lg">
                <CardHeader>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={userProfileData.photoURL || undefined} alt={userProfileData.name} />
                        <AvatarFallback>{getInitials(userProfileData.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{userProfileData.name}</CardTitle>
                        <CardDescription>{userProfileData.email}</CardDescription>
                    </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="space-y-6 pt-4 border-t">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editName">Full Name</Label>
                                    <Input id="editName" name="name" value={editFormData.name} onChange={handleProfileEditInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="editNativeLanguage">Native Language</Label>
                                    <Input id="editNativeLanguage" name="nativeLanguage" value={editFormData.nativeLanguage} onChange={handleProfileEditInputChange} placeholder="e.g., English" />
                                </div>
                                <div>
                                    <Label htmlFor="editCountry">Country</Label>
                                    <Input id="editCountry" name="country" value={editFormData.country} onChange={handleProfileEditInputChange} placeholder="e.g., USA" />
                                </div>
                                <div>
                                    <Label htmlFor="editAmharicLevel">Amharic Level</Label>
                                    <Select value={editFormData.amharicLevel} onValueChange={(value) => handleProfileSelectChange("amharicLevel", value)}>
                                        <SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="complete-beginner">Complete Beginner</SelectItem>
                                            <SelectItem value="some-words">Know Some Words</SelectItem>
                                            <SelectItem value="basic-conversation">Basic Conversation</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={isLoadingProfile}>
                                    {isLoadingProfile ? <Spinner size="sm" className="mr-2" /> : null} Save Changes
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                            </div>
                        </form>
                    ) : (
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Details</h3>
                            <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}><Edit3 className="mr-2 h-4 w-4" />Edit Profile</Button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div>
                                <h4 className="font-medium text-muted-foreground">Country</h4>
                                <p className="text-foreground text-base">{userProfileData.country || "Not specified"}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-muted-foreground">Amharic Level</h4>
                                <p className="text-foreground text-base capitalize">{userProfileData.amharicLevel?.replace(/-/g, " ") || "Not specified"}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-muted-foreground">Native Language</h4>
                                <p className="text-foreground text-base">{userProfileData.nativeLanguage || "Not specified"}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-muted-foreground">Member Since</h4>
                                <p className="text-foreground text-base">{userProfileData.createdAt ? format((userProfileData.createdAt as any).toDate(), "MMMM yyyy") : "N/A"}</p>
                            </div>
                        </div>
                    </div>
                    )}
                </CardContent>
            </Card>
         ) : (
            <p className="text-muted-foreground text-center py-10">Could not load profile information.</p>
         )}
    </div>
  );
}
