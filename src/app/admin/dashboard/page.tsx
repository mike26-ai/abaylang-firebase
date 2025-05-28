
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, MessageSquareText, Award, Users } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage Amharic Connect operations.',
};

// Mock data for dashboard stats (replace with actual data fetching)
const dashboardStats = {
  upcomingBookings: 5, // Example
  pendingTestimonials: 2, // Example
  newInquiries: 3, // Example
  totalStudents: 25, // Example
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of Amharic Connect activities.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <CalendarDays className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">lessons scheduled</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Testimonials</CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingTestimonials}</div>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
            <MessageSquareText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.newInquiries}</div>
            <p className="text-xs text-muted-foreground">unread messages</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">registered</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="hover-lift">
            <Link href="/admin/bookings" className="flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4" /> Manage Bookings
            </Link>
          </Button>
          <Button asChild variant="outline" className="hover-lift">
            <Link href="/admin/testimonials" className="flex items-center justify-center gap-2">
              <Award className="h-4 w-4" /> Approve Testimonials
            </Link>
          </Button>
          <Button asChild variant="outline" className="hover-lift">
            <Link href="/admin/inquiries" className="flex items-center justify-center gap-2">
              <MessageSquareText className="h-4 w-4" /> View Inquiries
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
