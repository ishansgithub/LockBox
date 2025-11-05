'use client';

import { BankListItem } from '@/lib/types';
import BankCard from './BankCard';
import { Banknote } from 'lucide-react';

interface BankListProps {
  banks: BankListItem[];
  onEdit: (bank: BankListItem) => void;
  onDelete: (bank: BankListItem) => void;
  onView: (bank: BankListItem) => void;
}

export default function BankList({ banks, onEdit, onDelete, onView }: BankListProps) {
  if (banks.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-lg border border-dashed">
        <Banknote className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No bank credentials stored</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Click 'Add Bank' to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {banks.map((bank) => (
        <BankCard
          key={bank.id}
          bank={bank}
          onEdit={() => onEdit(bank)}
          onDelete={() => onDelete(bank)}
          onView={() => onView(bank)}
        />
      ))}
    </div>
  );
}
