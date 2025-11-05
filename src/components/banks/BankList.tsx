'use client';

import { useState, useMemo } from 'react';
import { BankListItem } from '@/lib/types';
import BankCard from './BankCard';
import { Banknote, Search, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface BankListProps {
  banks: BankListItem[];
  onEdit: (bank: BankListItem) => void;
  onDelete: (bank: BankListItem) => void;
  onView: (bank: BankListItem) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'account-asc' | 'account-desc';

export default function BankList({ banks, onEdit, onDelete, onView }: BankListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const { toast } = useToast();

  const filteredAndSortedBanks = useMemo(() => {
    let filtered = banks;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = banks.filter(
        (bank) =>
          bank.bankName.toLowerCase().includes(query) ||
          bank.accountNumber.toLowerCase().includes(query)
      );
    }

    // Sort banks
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.bankName.localeCompare(b.bankName);
        case 'name-desc':
          return b.bankName.localeCompare(a.bankName);
        case 'account-asc':
          return a.accountNumber.localeCompare(b.accountNumber);
        case 'account-desc':
          return b.accountNumber.localeCompare(a.accountNumber);
        default:
          return 0;
      }
    });

    return sorted;
  }, [banks, searchQuery, sortBy]);

  const exportToCSV = () => {
    if (filteredAndSortedBanks.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no banks to export.',
        variant: 'destructive',
      });
      return;
    }

    // Create CSV content
    const headers = ['Bank Name', 'Account Number'];
    const rows = filteredAndSortedBanks.map((bank) => [
      bank.bankName,
      bank.accountNumber,
    ]);

    // Escape values that contain commas or quotes
    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `lockbox-banks-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: `Exported ${filteredAndSortedBanks.length} bank${filteredAndSortedBanks.length === 1 ? '' : 's'} to CSV.`,
    });
  };

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
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by bank name or account number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="account-asc">Account (Asc)</SelectItem>
            <SelectItem value="account-desc">Account (Desc)</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={exportToCSV}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          Found {filteredAndSortedBanks.length} of {banks.length} banks
        </div>
      )}

      {/* Bank Cards */}
      {filteredAndSortedBanks.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
          <Banknote className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No banks found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedBanks.map((bank) => (
            <BankCard
              key={bank.id}
              bank={bank}
              onEdit={() => onEdit(bank)}
              onDelete={() => onDelete(bank)}
              onView={() => onView(bank)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
