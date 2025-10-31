
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, PlusCircle, User, Users, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface PrivateGroupFormProps {
  onMembersChange: (members: { name: string; email: string }[]) => void;
}

export function PrivateGroupForm({ onMembersChange }: PrivateGroupFormProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<{ name: string; email: string }[]>([]);
  const [newMember, setNewMember] = useState({ name: '', email: '' });

  const addMember = () => {
    if (newMember.name && newMember.email) {
      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);
      onMembersChange(updatedMembers);
      setNewMember({ name: '', email: '' });
    }
  };

  const removeMember = (index: number) => {
    const updatedMembers = members.filter((_, i) => i !== index);
    setMembers(updatedMembers);
    onMembersChange(updatedMembers);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <Users className="w-5 h-5 text-primary" />
          2. Build Your Private Group
        </CardTitle>
        <CardDescription>Invite friends or family to join your private lesson. You need at least one other person.</CardDescription>
      </CardHeader>
      
      <div className="space-y-4">
        {/* The leader's card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center gap-3">
             <User className="w-5 h-5 text-primary" />
             <div>
                <p className="font-semibold text-foreground">{user?.displayName} (You)</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
             </div>
          </CardContent>
        </Card>

        {/* List of added members */}
        {members.map((member, index) => (
          <Card key={index} className="bg-muted/50">
            <CardContent className="p-3 flex items-center justify-between gap-3">
               <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => removeMember(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
               </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form to add a new member */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="font-medium text-foreground">Add a new member</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="new-member-name">Member's Name</Label>
            <Input
              id="new-member-name"
              placeholder="e.g., Jane Doe"
              value={newMember.name}
              onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-member-email">Member's Email</Label>
            <Input
              id="new-member-email"
              type="email"
              placeholder="e.g., jane@example.com"
              value={newMember.email}
              onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>
        <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addMember}
            disabled={!newMember.name || !newMember.email}
        >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Member to Group
        </Button>
      </div>
    </div>
  );
}
