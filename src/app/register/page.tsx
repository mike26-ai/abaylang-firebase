
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Timestamp, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // auth is imported here
import type { UserProfile } from "@/lib/types";
import { Logo } from "@/components/layout/logo";
import { Spinner } from "@/components/ui/spinner";

// Ensure the placeholder values match exactly those in src/lib/firebase.ts
const PLACEHOLDER_API_KEY = "YOUR_API_KEY";
const PLACEHOLDER_AUTH_DOMAIN = "YOUR_AUTH_DOMAIN";
const PLACEHOLDER_PROJECT_ID = "YOUR_PROJECT_ID";


export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    amharicLevel: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Check for Firebase configuration before attempting to call Firebase services
    if (
      auth.app.options.apiKey === PLACEHOLDER_API_KEY ||
      auth.app.options.authDomain === PLACEHOLDER_AUTH_DOMAIN ||
      auth.app.options.projectId === PLACEHOLDER_PROJECT_ID
    ) {
      setError(
        "Firebase is not configured correctly. Please ensure API key and other Firebase project settings are correctly set in your environment variables."
      );
      setIsLoading(false);
      return;
    }

    if (!formData.country) {
      setError("Please select your country.");
      setIsLoading(false);
      return;
    }
    if (!formData.amharicLevel) {
      setError("Please select your Amharic level.");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false)
      return
    }
    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions.");
      setIsLoading(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (user) {
        // Update Firebase Auth profile
        await updateProfile(user, { displayName: `${formData.firstName} ${formData.lastName}` });

        // Create user document in Firestore
        const userProfileForFirestore: UserProfile = {
          uid: user.uid,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: "student", // Default role
          createdAt: Timestamp.now(),
          photoURL: user.photoURL || null,
          country: formData.country,
          amharicLevel: formData.amharicLevel,
        };
        await setDoc(doc(db, "users", user.uid), userProfileForFirestore);
      }

      alert("Registration Successful! Your account has been created. Welcome to LissanHub!");
      router.push("/profile"); 
    } catch (err: any) {
      console.error("Registration error:", err);
      let friendlyMessage = "An error occurred during registration. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "This email address is already in use. Please try logging in or use a different email.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "The password is too weak. Please choose a stronger password (at least 6 characters).";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "The email address is not valid.";
      } else if (err.message) {
         // Use the Firebase error message if it's somewhat user-friendly
        friendlyMessage = err.message.includes("Firebase:") ? err.message.split("Firebase: ")[1].split(" (")[0] : err.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to LissanHub
          </Link>
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join LissanHub</h1>
          <p className="text-muted-foreground">Start your journey to reconnect with your heritage</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join thousands of diaspora learners worldwide</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                  name="country" 
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="se">Sweden</SelectItem>
                    <SelectItem value="no">Norway</SelectItem>
                    <SelectItem value="et">Ethiopia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amharicLevel">Current Amharic Level</Label>
                <Select
                  value={formData.amharicLevel}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, amharicLevel: value }))}
                  name="amharicLevel"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete-beginner">Complete Beginner</SelectItem>
                    <SelectItem value="some-words">Know Some Words</SelectItem>
                    <SelectItem value="basic-conversation">Basic Conversation</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
