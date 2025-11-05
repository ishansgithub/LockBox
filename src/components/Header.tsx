
'use client';
import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle, Lock, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/types';
import { Avatar, AvatarFallback } from './ui/avatar';


interface HeaderProps {
  user: User;
  onAddBank: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}

export default function Header({ user, onAddBank, onChangePassword, onLogout }: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  }
  
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="relative bg-card/30 dark:bg-card/20 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-full shadow-2xl shadow-black/5 dark:shadow-black/30">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 via-transparent to-transparent dark:from-white/5 pointer-events-none"></div>
        <div className="flex h-14 items-center justify-between px-6 relative">
          <div className="flex items-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Lockbox</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onAddBank} size="sm" className="rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Bank
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Signed in as</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={onChangePassword}>
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
