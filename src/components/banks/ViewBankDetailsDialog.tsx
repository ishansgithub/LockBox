
'use client';

import { Bank } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Landmark, Hash, Asterisk, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useState } from 'react';

interface ViewBankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
}

const DetailRow = ({ icon, label, value, isSecret = false }: { icon: React.ElementType, label: string, value?: string, isSecret?: boolean }) => {
  const { toast } = useToast();
  const Icon = icon;
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = () => {
    if(value) {
      navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: `${label} has been copied to your clipboard.`,
        className: 'bg-green-500 text-white',
      })
    }
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="space-y-1">
       <Label className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</Label>
      <div className="flex items-center space-x-2">
        <Input value={value || 'N/A'} readOnly type={isSecret && !isVisible ? 'password' : 'text'} className="font-mono" />
        {isSecret && value && value !== 'N/A' && (
          <Button variant="ghost" size="icon" onClick={toggleVisibility}>
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
        {value && value !== 'N/A' && <Button variant="outline" size="sm" onClick={handleCopy}>Copy</Button>}
      </div>
    </div>
  );
};


export default function ViewBankDetailsDialog({ open, onOpenChange, bank }: ViewBankDetailsDialogProps) {
  if (!bank) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-6 w-6" />
            {bank.bankName}
          </DialogTitle>
          <DialogDescription>
            Account ending in ...{bank.accountNumber.slice(-4)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <DetailRow icon={Hash} label="Account Number" value={bank.accountNumber} />
          <Separator />
          <h4 className="font-medium text-sm text-primary">Net Banking</h4>
          <DetailRow icon={Hash} label="Username" value={bank.netBankingUsername} />
          <DetailRow icon={Asterisk} label="Password" value={bank.netBankingPassword} isSecret />
          <Separator />
          <h4 className="font-medium text-sm text-primary">Mobile Banking</h4>
          <DetailRow icon={Hash} label="Username" value={bank.mobileBankingUsername} />
          <DetailRow icon={Asterisk} label="Password" value={bank.mobileBankingPassword} isSecret />
          <Separator />
           <h4 className="font-medium text-sm text-primary">Card Details</h4>
          <DetailRow icon={Asterisk} label="ATM PIN" value={bank.atmPin} isSecret />

          {bank.customFields && bank.customFields.length > 0 && (
            <>
              <Separator />
              <h4 className="font-medium text-sm text-primary">Additional Information</h4>
              {bank.customFields.map((field, index) => (
                <DetailRow key={index} icon={Asterisk} label={field.label} value={field.value} isSecret />
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
