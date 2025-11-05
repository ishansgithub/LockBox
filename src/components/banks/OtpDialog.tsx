'use client';

import { useEffect, useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { requestOtpForBank, verifyOtpAndGetBankDetails } from '@/lib/actions';
import { Bank, BankListItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: BankListItem | null;
  onSuccess: (decryptedBank: Bank) => void;
}

export default function OtpDialog({ open, onOpenChange, bank, onSuccess }: OtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [isRequesting, startRequestTransition] = useTransition();
  const [isVerifying, startVerifyTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (open && bank) {
      startRequestTransition(async () => {
        const result = await requestOtpForBank(bank.id);
        if (result.error) {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
          toast({
            title: 'OTP Sent!',
            description: result.success,
            duration: 5000,
          });
        }
      });
    }
  }, [open, bank, toast]);

  const handleVerify = () => {
    if (!bank || otp.length !== 6) return;
    startVerifyTransition(async () => {
      const result = await verifyOtpAndGetBankDetails(bank.id, otp);
      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else if (result.bank) {
        toast({ title: 'Success', description: 'Credentials unlocked.', className: 'bg-green-500 text-white' });
        onSuccess(result.bank);
        onOpenChange(false);
      }
    });
  };

  const isPending = isRequesting || isVerifying;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>
            An OTP has been sent to the phone number associated with{' '}
            <span className="font-semibold">{bank?.bankName}</span>. It is valid for 5 minutes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
            maxLength={6}
            className="text-center text-lg tracking-[0.5em]"
            disabled={isPending}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleVerify} disabled={isPending || otp.length !== 6}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & View
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
