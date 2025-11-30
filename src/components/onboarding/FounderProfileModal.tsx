import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/store';
import { useToast } from '@/hooks/use-toast';

interface FounderProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FounderProfileModal({ open, onOpenChange }: FounderProfileModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const updatePassport = useStore((state) => state.updatePassport);
  const { toast } = useToast();

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide your name and email address',
        variant: 'destructive'
      });
      return;
    }

    // Update the passport with founder information
    updatePassport({
      founderName: name,
      founderEmail: email,
      founderLinkedIn: linkedIn
    });

    toast({
      title: 'Profile saved',
      description: 'Your founder profile has been saved successfully'
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Your Founder Profile</DialogTitle>
          <DialogDescription>
            We need some basic information to complete your startup passport.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
            <Input
              id="linkedin"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
