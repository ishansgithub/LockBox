
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Bank, BankFormValues, BankListItem, User, ChangePasswordFormValues } from './types';
import { encrypt, decrypt } from './encryption';
import { randomUUID } from 'crypto';
import { getUsersCollection } from './db';

// Helper function to convert MongoDB document to plain object
// Removes _id field and converts to plain JavaScript object
function toPlainObject<T>(doc: T & { _id?: any }): T {
  const { _id, ...rest } = doc as any;
  return JSON.parse(JSON.stringify(rest)) as T;
}

const customFieldSchema = z.object({
  label: z.string().min(1, 'Label cannot be empty'),
  value: z.string().min(1, 'Value cannot be empty'),
});

const bankFormSchema = z.object({
  bankName: z.string().min(2, 'Bank name must be at least 2 characters'),
  phoneForOtp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  accountNumber: z.string().min(5, 'Account number is too short').max(20, 'Account number is too long'),
  netBankingUsername: z.string().min(1, 'Username is required'),
  netBankingPassword: z.string().optional(),
  mobileBankingUsername: z.string().min(1, 'Username is required'),
  mobileBankingPassword: z.string().optional(),
  atmPin: z.string().regex(/^\d{4}$/, 'ATM PIN must be 4 digits').optional().or(z.literal('')),
  customFields: z.array(customFieldSchema).optional(),
});


export async function getBanksForUser(userId: string): Promise<BankListItem[]> {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ id: userId });
  if (!user) {
    return [];
  }
  return user.banks.map(({ id, bankName, accountNumber }) => ({ 
    id, 
    bankName: decrypt(bankName), 
    accountNumber: decrypt(accountNumber) 
  }));
}


export async function addBank(userId: string, values: BankFormValues) {
  const validatedFields = bankFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }
  const data = validatedFields.data;

  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ id: userId });
  if (!user) {
    return { error: 'User not found.' };
  }

  const newBank: Bank = {
    id: randomUUID(),
    bankName: encrypt(data.bankName),
    phoneForOtp: encrypt(data.phoneForOtp),
    accountNumber: encrypt(data.accountNumber),
    netBankingUsername: encrypt(data.netBankingUsername),
    netBankingPassword: data.netBankingPassword ? encrypt(data.netBankingPassword) : undefined,
    mobileBankingUsername: encrypt(data.mobileBankingUsername),
    mobileBankingPassword: data.mobileBankingPassword ? encrypt(data.mobileBankingPassword) : undefined,
    atmPin: data.atmPin ? encrypt(data.atmPin) : undefined,
    customFields: data.customFields?.map(field => ({
      label: encrypt(field.label),
      value: encrypt(field.value),
    })),
  };

  await usersCollection.updateOne(
    { id: userId },
    { $push: { banks: newBank } }
  );
  revalidatePath('/');
  return { success: 'Bank added successfully.' };
}

export async function updateBank(userId: string, bankId: string, values: BankFormValues) {
    const validatedFields = bankFormSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    const data = validatedFields.data;

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ id: userId });

    if (!user) {
        return { error: 'User not found.' };
    }

    const bankIndex = user.banks.findIndex((b) => b.id === bankId);

    if (bankIndex === -1) {
        return { error: 'Bank not found.' };
    }

    const existingBank = user.banks[bankIndex];

    const updatedBank: Bank = {
        ...existingBank,
        bankName: encrypt(data.bankName),
        phoneForOtp: encrypt(data.phoneForOtp),
        accountNumber: encrypt(data.accountNumber),
        netBankingUsername: encrypt(data.netBankingUsername),
        mobileBankingUsername: encrypt(data.mobileBankingUsername),
    };
    
    // Only update password if a new one is provided (non-empty string)
    if (data.netBankingPassword && data.netBankingPassword.trim() !== '') {
        updatedBank.netBankingPassword = encrypt(data.netBankingPassword);
    }
    if (data.mobileBankingPassword && data.mobileBankingPassword.trim() !== '') {
        updatedBank.mobileBankingPassword = encrypt(data.mobileBankingPassword);
    }
    if (data.atmPin && data.atmPin.trim() !== '') {
        updatedBank.atmPin = encrypt(data.atmPin);
    }

    // Process custom fields: update existing, encrypt new
    if (data.customFields) {
        updatedBank.customFields = data.customFields.map(field => {
            return {
                label: encrypt(field.label),
                value: encrypt(field.value),
            };
        });
    }

    // Update the bank in the array
    user.banks[bankIndex] = updatedBank;
    await usersCollection.updateOne(
        { id: userId },
        { $set: { banks: user.banks } }
    );
    revalidatePath('/');
    return { success: 'Bank updated successfully.' };
}

export async function deleteBank(userId: string, bankId: string) {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ id: userId });

  if (!user) {
      return { error: 'User not found.' };
  }

  const initialBankCount = user.banks.length;
  const updatedBanks = user.banks.filter((b) => b.id !== bankId);

  if (updatedBanks.length === initialBankCount) {
      return { error: 'Bank not found.' };
  }

  await usersCollection.updateOne(
      { id: userId },
      { $set: { banks: updatedBanks } }
  );
  revalidatePath('/');
  return { success: 'Bank deleted successfully.' };
}

export async function verifyMasterPassword(username: string, password: string) {
  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, 'i') } 
  });

  // Decrypt and verify the master password
  if (user && user.masterPassword) {
    try {
      const decryptedPassword = decrypt(user.masterPassword);
      if (decryptedPassword === password) {
        // Convert MongoDB document to plain object and remove sensitive data
        const plainUser = toPlainObject(user);
        const { masterPassword, ...userToReturn } = plainUser;
        return { success: 'Login successful.', user: userToReturn };
      }
    } catch (error) {
      // If decryption fails, try plain text comparison for backward compatibility
      // (for users created before encryption was added)
      if (user.masterPassword === password) {
        // Convert to plain object and remove sensitive data
        const plainUser = toPlainObject(user);
        const { masterPassword, ...userToReturn } = plainUser;
        return { success: 'Login successful.', user: userToReturn };
      }
    }
  }

  return { error: 'Invalid username or password.' };
}

export async function decryptBank(userId: string, bankId: string) {
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ id: userId });
  if (!user) {
    return { error: 'User not found.' };
  }

  const bank = user.banks.find((b) => b.id === bankId);
  if (!bank) {
    return { error: 'Bank not found.' };
  }
  
  const decryptedBank: Bank = {
    ...bank,
    bankName: decrypt(bank.bankName),
    phoneForOtp: decrypt(bank.phoneForOtp),
    accountNumber: decrypt(bank.accountNumber),
    netBankingUsername: decrypt(bank.netBankingUsername),
    netBankingPassword: bank.netBankingPassword ? decrypt(bank.netBankingPassword) : 'N/A',
    mobileBankingUsername: decrypt(bank.mobileBankingUsername),
    mobileBankingPassword: bank.mobileBankingPassword ? decrypt(bank.mobileBankingPassword) : 'N/A',
    atmPin: bank.atmPin ? decrypt(bank.atmPin) : 'N/A',
    customFields: bank.customFields?.map(field => ({
      label: decrypt(field.label),
      value: field.value ? decrypt(field.value) : 'N/A',
    })),
  };

  return { success: 'Bank decrypted.', bank: decryptedBank };
}

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function createUser(values: unknown) {
    const validatedFields = createUserSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided. Username must be at least 3 characters and password at least 8.' };
    }
    const { username, password } = validatedFields.data;

    const usersCollection = await getUsersCollection();

    const existingUser = await usersCollection.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });
    if (existingUser) {
        return { error: 'Username already taken.' };
    }

    const newUser: User = {
        id: randomUUID(),
        username: username,
        masterPassword: encrypt(password), // Encrypt the master password
        banks: [],
    };

    await usersCollection.insertOne(newUser);

    // Convert to plain object and remove sensitive data
    const plainUser = toPlainObject(newUser);
    const { masterPassword, ...userToReturn } = plainUser;

    return { success: `User '${username}' created successfully! You can now log in.`, user: userToReturn };
}


const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

export async function changeMasterPassword(userId: string, values: ChangePasswordFormValues) {
  const validatedFields = changePasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0];
    return { error: `${firstError.path.join('.')}: ${firstError.message}` };
  }

  const { currentPassword, newPassword } = validatedFields.data;
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ id: userId });

  if (!user) {
    return { error: 'User not found.' };
  }

  // Decrypt and verify the current password
  let isPasswordValid = false;
  try {
    if (user.masterPassword) {
      const decryptedPassword = decrypt(user.masterPassword);
      isPasswordValid = decryptedPassword === currentPassword;
    }
  } catch (error) {
    // If decryption fails, try plain text comparison for backward compatibility
    // (for users created before encryption was added)
    isPasswordValid = user.masterPassword === currentPassword;
  }

  if (!isPasswordValid) {
    return { error: 'Incorrect current password.' };
  }

  // Encrypt the new password before saving
  await usersCollection.updateOne(
      { id: userId },
      { $set: { masterPassword: encrypt(newPassword) } }
  );

  return { success: 'Master password updated successfully.' };
}
