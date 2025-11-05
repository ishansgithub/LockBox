
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bank, BankFormValues } from '@/lib/types';
import { addBank, updateBank } from '@/lib/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { Separator } from '../ui/separator';

interface BankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
  userId: string;
}

const customFieldSchema = z.object({
  label: z.string().min(1, 'Label cannot be empty'),
  value: z.string().min(1, 'Value cannot be empty'),
});

const formSchema = z.object({
  bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  phoneForOtp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code (e.g., +14155552671)'),
  accountNumber: z.string().min(5, 'Account number is too short').max(20, 'Account number is too long'),
  netBankingUsername: z.string().min(1, 'Username is required'),
  netBankingPassword: z.string().optional(),
  mobileBankingUsername: z.string().min(1, 'Username is required'),
  mobileBankingPassword: z.string().optional(),
  atmPin: z.string().regex(/^\d{4}$/, 'ATM PIN must be 4 digits').optional().or(z.literal('')),
  customFields: z.array(customFieldSchema).optional(),
});


export default function BankFormDialog({ open, onOpenChange, bank, userId }: BankFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [passwordVisibility, setPasswordVisibility] = useState({
    netBanking: false,
    mobileBanking: false,
    atmPin: false,
    custom: {} as Record<number, boolean>,
  });
  const { toast } = useToast();
  const form = useForm<BankFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: '',
      phoneForOtp: '',
      accountNumber: '',
      netBankingUsername: '',
      netBankingPassword: '',
      mobileBankingUsername: '',
      mobileBankingPassword: '',
      atmPin: '',
      customFields: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields",
  });
  
  const togglePasswordVisibility = (field: keyof typeof passwordVisibility, index?: number) => {
    setPasswordVisibility(prev => {
      if (field === 'custom' && index !== undefined) {
        return {
          ...prev,
          custom: { ...prev.custom, [index]: !prev.custom[index] }
        };
      }
      return { ...prev, [field]: !prev[field as Exclude<keyof typeof passwordVisibility, 'custom'>] };
    });
  };

  useEffect(() => {
    if (open) {
      if (bank) {
          form.reset({
              ...bank,
              customFields: bank.customFields || [],
              netBankingPassword: '', // Always clear passwords for security
              mobileBankingPassword: '',
              atmPin: '',
          });
      } else {
          form.reset({
              bankName: '',
              phoneForOtp: '',
              accountNumber: '',
              netBankingUsername: '',
              netBankingPassword: '',
              mobileBankingUsername: '',
              mobileBankingPassword: '',
              atmPin: '',
              customFields: [],
          });
      }
      // Reset visibility on open
      setPasswordVisibility({ netBanking: false, mobileBanking: false, atmPin: false, custom: {} });
    }
  }, [bank, form, open]);

  const onSubmit = (values: BankFormValues) => {
    // Filter out empty custom fields before submission
    const processedValues = {
      ...values,
      customFields: values.customFields?.filter(f => f.label && f.value)
    };
    
    startTransition(async () => {
      const action = bank ? updateBank(userId, bank.id, processedValues) : addBank(userId, processedValues);
      const result = await action;
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: result.success,
          variant: 'default',
          className: 'bg-green-500 text-white',
        });
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bank ? 'Edit Bank' : 'Add Bank'}</DialogTitle>
          <DialogDescription>
            {bank ? 'Update the details for this bank account.' : 'Add a new bank account to your Lockbox.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Global Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="phoneForOtp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registered Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+14155552671" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="netBankingUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Banking User</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netBankingPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Banking Pass</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input type={passwordVisibility.netBanking ? 'text' : 'password'} placeholder={bank ? "New password" : "Password"} {...field} />
                        </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => togglePasswordVisibility('netBanking')}>
                          {passwordVisibility.netBanking ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileBankingUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Banking User</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileBankingPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Banking Pass</FormLabel>
                      <div className="flex items-center gap-2">
                      <FormControl>
                        <Input type={passwordVisibility.mobileBanking ? 'text' : 'password'} placeholder={bank ? "New password" : "Password"} {...field} />
                      </FormControl>
                        <Button type="button" variant="ghost" size="icon" onClick={() => togglePasswordVisibility('mobileBanking')}>
                          {passwordVisibility.mobileBanking ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="atmPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ATM PIN</FormLabel>
                     <div className="flex items-center gap-2">
                      <FormControl>
                        <Input type={passwordVisibility.atmPin ? 'text' : 'password'} placeholder="4-digit PIN" maxLength={4} {...field} />
                      </FormControl>
                       <Button type="button" variant="ghost" size="icon" onClick={() => togglePasswordVisibility('atmPin')}>
                          {passwordVisibility.atmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Custom Fields</h4>
              {fields.map((field, index) => (
                 <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`customFields.${index}.label`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? 'sr-only' : ''}>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Swift Code" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customFields.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                           <FormLabel className={index !== 0 ? 'sr-only' : ''}>Value</FormLabel>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input type={passwordVisibility.custom[index] ? 'text' : 'password'} placeholder="Value" {...field} />
                              </FormControl>
                              <Button type="button" variant="ghost" size="icon" onClick={() => togglePasswordVisibility('custom', index)}>
                                {passwordVisibility.custom[index] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ label: "", value: "" })}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Custom Field
              </Button>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {bank ? 'Save Changes' : 'Add Bank'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
