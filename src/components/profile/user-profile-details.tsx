
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
// TODO: When implementing file uploads, import the server action.
// import { uploadImage } from "@/app/actions/uploadActions";


export function UserProfileDetails() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);

  // TODO: Add state and handlers for file input to manage profile picture uploads.
  // const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      
      // TODO: Logic to upload a new profile picture if one has been selected.
      // let imageUrl = user.photoURL;
      // if (profileImageFile) {
      //   const formData = new FormData();
      //   formData.append('file', profileImageFile);
      //   const result = await uploadImage(formData);
      //   if (result.success && result.url) {
      //     imageUrl = result.url;
      //   } else {
      //     throw new Error(result.error || "Image upload failed.");
      //   }
      // }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { 
        displayName,
        // photoURL: imageUrl,
      });

      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { 
        name: displayName,
        // photoURL: imageUrl,
      });
      
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
      setIsEditing(false);
      // setProfileImageFile(null); // Clear file selection
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="person avatar" />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{user.displayName || "User"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1"
              />
            </div>
             {/* TODO: Add a file input for changing the profile picture */}
            {/*
            <div>
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input 
                id="profilePicture" 
                type="file" 
                accept="image/*" 
                onChange={(e) => setProfileImageFile(e.target.files ? e.target.files[0] : null)}
                className="mt-1"
              />
            </div>
            */}
            <div className="flex space-x-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Spinner size="sm" className="mr-2"/> : null}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => {setIsEditing(false); setDisplayName(user.displayName || "")}}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <h4 className="font-semibold">Name:</h4>
              <p>{user.displayName || "Not set"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Email:</h4>
              <p>{user.email}</p>
            </div>
            <Button onClick={() => setIsEditing(true)} className="mt-4">Edit Profile</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    