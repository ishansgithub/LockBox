
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BankList from '@/components/banks/BankList';
import BankFormDialog from '@/components/banks/BankFormDialog';
import ViewBankDetailsDialog from '@/components/banks/ViewBankDetailsDialog';
import { Bank, BankListItem, User } from '@/lib/types';
import LoginScreen from './LoginScreen';
import { decryptBank, getBanksForUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import DeleteConfirmationDialog from './banks/DeleteConfirmationDialog';
import ChangePasswordDialog from './ChangePasswordDialog';

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [banks, setBanks] = useState<BankListItem[]>([]);
  const [dialog, setDialog] = useState<'add' | 'edit' | 'delete' | 'viewDetails' | 'changePassword' | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankListItem | Bank | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsLoading(true);
    const userBanks = await getBanksForUser(user.id);
    setBanks(userBanks);
    setIsLoading(false);
  };
  
  const refreshBanks = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    const userBanks = await getBanksForUser(currentUser.id);
    setBanks(userBanks);
    setIsLoading(false);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setBanks([]);
    setSelectedBank(null);
  };


  const handleAdd = () => {
    setSelectedBank(null);
    setDialog('add');
  };

  const fetchDecryptedBank = async (bankId: string): Promise<Bank | null> => {
    if (!currentUser) return null;
    setIsLoading(true);
    try {
      const result = await decryptBank(currentUser.id, bankId);
      if (result.error || !result.bank) {
        toast({ title: 'Error', description: result.error || 'Could not retrieve bank details.', variant: 'destructive' });
        return null;
      }
      return result.bank;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (bank: BankListItem) => {
    const decryptedBank = await fetchDecryptedBank(bank.id);
    if (decryptedBank) {
      setSelectedBank(decryptedBank);
      setDialog('edit');
    }
  };

  const handleDelete = (bank: BankListItem) => {
    setSelectedBank(bank);
    setDialog('delete');
  };

  const handleView = async (bank: BankListItem) => {
    const decryptedBank = await fetchDecryptedBank(bank.id);
    if (decryptedBank) {
      setSelectedBank(decryptedBank);
      setDialog('viewDetails');
    }
  };
  
  const closeDialogs = () => {
    setDialog(null);
    refreshBanks();
  };
  
  const closePasswordDialog = () => {
    setDialog(null);
    // Optional: add a success message for password change
  }

  if (!currentUser) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      <Header 
        user={currentUser} 
        onAddBank={handleAdd} 
        onChangePassword={() => setDialog('changePassword')}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <BankList
          banks={banks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </main>

      <BankFormDialog
        open={dialog === 'add' || dialog === 'edit'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={dialog === 'edit' ? (selectedBank as Bank) : null}
        userId={currentUser.id}
      />

      <DeleteConfirmationDialog
        open={dialog === 'delete'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={selectedBank as BankListItem}
        userId={currentUser.id}
      />

      <ViewBankDetailsDialog
        open={dialog === 'viewDetails'}
        onOpenChange={(isOpen) => !isOpen && closeDialogs()}
        bank={selectedBank as Bank}
      />

      <ChangePasswordDialog
        open={dialog === 'changePassword'}
        onOpenChange={(isOpen) => !isOpen && closePasswordDialog()}
        userId={currentUser.id}
      />
    </>
  );
}
