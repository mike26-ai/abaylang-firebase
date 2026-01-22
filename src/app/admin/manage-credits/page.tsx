
import { CreditManager } from "@/components/admin/credit-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { Ticket } from "lucide-react";

export const metadata: Metadata = {
  title: 'Manage Credits - Admin',
  description: 'View and manage student lesson credits.',
};

export default function AdminCreditsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <Ticket className="h-7 w-7 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Student Credits</h1>
            <p className="text-muted-foreground">View purchased packages and credit balances for all students.</p>
        </div>
      </header>
      
      <CreditManager />

    </div>
  );
}
