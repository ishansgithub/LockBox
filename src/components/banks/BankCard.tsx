'use client';

import { BankListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Edit, Eye, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface BankCardProps {
  bank: BankListItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BankCard({ bank, onView, onEdit, onDelete }: BankCardProps) {
  return (
    <Card className="flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-headline">{bank.bankName}</CardTitle>
          <CardDescription>Account: ...{bank.accountNumber.slice(-4)}</CardDescription>
        </div>
        <Banknote className="h-8 w-8 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {/* Can add more non-sensitive details here if needed */}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
         <Button onClick={onView} className="flex-grow bg-accent hover:bg-accent/90">
          <Eye className="mr-2 h-4 w-4" />
          View Credentials
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
