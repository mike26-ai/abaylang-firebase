
import { UserProfileDetails } from "@/components/profile/user-profile-details";
import { MyBookings } from "@/components/profile/my-bookings";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
};

export default function ProfilePage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile and lesson bookings.</p>
      </header>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UserProfileDetails />
        </div>
        <div className="lg:col-span-2">
          <MyBookings />
        </div>
      </div>
    </div>
  );
}

