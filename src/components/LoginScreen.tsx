
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifyMasterPassword } from '@/lib/actions';
import { User } from '@/lib/types';
import { Label } from '@/components/ui/label';
import SignUpDialog from './SignUpDialog';

interface LoginScreenProps {
  onSuccess: (user: User) => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await verifyMasterPassword(username, password);
      if (result.success && result.user) {
        toast({ title: 'Success!', description: 'Logged in successfully.', className: 'bg-green-500 text-white' });
        onSuccess(result.user);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary">Lockbox</CardTitle>
            <CardDescription>Enter your credentials to unlock your vault.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          id="username"
                          type="text"
                          placeholder="Your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={isPending}
                          className="pl-10 h-12 text-lg"
                      />
                  </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="password">Master Password</Label>
                  <Input
                  id="password"
                  type="password"
                  placeholder="Your master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className="h-12 text-lg"
                  />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full h-12 text-lg" disabled={isPending || !password || !username}>
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Unlock
              </Button>
               <Button type="button" variant="outline" className="w-full" onClick={() => setIsSignUpOpen(true)}>
                <UserPlus className="mr-2 h-5 w-5" />
                Create Account
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <SignUpDialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen} onSignUpSuccess={(newUser) => {
        setUsername(newUser.username);
        setPassword(''); // Clear password field for security
      }}/>
    </>
  );
}
