
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Bank, BankFormValues, BankListItem, User, ChangePasswordFormValues } from './types';
import { encrypt, decrypt } from './encryption';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readDb(): Promise<User[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await writeDb([]); // Create the file if it doesn't exist
      return [];
    }
    throw error;
  }
}

async function writeDb(data: User[]): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
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
  const users = await readDb();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return [];
  }
  return user.banks.map(({ id, bankName, accountNumber }) => ({ id, bankName, accountNumber }));
}


export async function addBank(userId: string, values: BankFormValues) {
  const validatedFields = bankFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }
  const data = validatedFields.data;

  const users = await readDb();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return { error: 'User not found.' };
  }

  const newBank: Bank = {
    id: randomUUID(),
    bankName: data.bankName,
    phoneForOtp: data.phoneForOtp,
    accountNumber: data.accountNumber,
    netBankingUsername: data.netBankingUsername,
    netBankingPassword: data.netBankingPassword ? encrypt(data.netBankingPassword) : undefined,
    mobileBankingUsername: data.mobileBankingUsername,
    mobileBankingPassword: data.mobileBankingPassword ? encrypt(data.mobileBankingPassword) : undefined,
    atmPin: data.atmPin ? encrypt(data.atmPin) : undefined,
    customFields: data.customFields?.map(field => ({
      ...field,
      value: encrypt(field.value),
    })),
  };

  users[userIndex].banks.push(newBank);
  await writeDb(users);
  revalidatePath('/');
  return { success: 'Bank added successfully.' };
}

export async function updateBank(userId: string, bankId: string, values: BankFormValues) {
    const validatedFields = bankFormSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    const data = validatedFields.data;

    const users = await readDb();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
        return { error: 'User not found.' };
    }

    const bankIndex = users[userIndex].banks.findIndex((b) => b.id === bankId);

    if (bankIndex === -1) {
        return { error: 'Bank not found.' };
    }

    const existingBank = users[userIndex].banks[bankIndex];

    const updatedBank: Bank = {
        ...existingBank,
        bankName: data.bankName,
        phoneForOtp: data.phoneForOtp,
        accountNumber: data.accountNumber,
        netBankingUsername: data.netBankingUsername,
        mobileBankingUsername: data.mobileBankingUsername,
    };
    
    // Only update password if a new one is provided
    if (data.netBankingPassword) {
        updatedBank.netBankingPassword = encrypt(data.netBankingPassword);
    }
    if (data.mobileBankingPassword) {
        updatedBank.mobileBankingPassword = encrypt(data.mobileBankingPassword);
    }
    if (data.atmPin) {
        updatedBank.atmPin = encrypt(data.atmPin);
    }

    // Process custom fields: update existing, encrypt new
    if (data.customFields) {
        updatedBank.customFields = data.customFields.map(field => {
            return {
                ...field,
                value: encrypt(field.value),
            };
        });
    }

    users[userIndex].banks[bankIndex] = updatedBank;
    await writeDb(users);
    revalidatePath('/');
    return { success: 'Bank updated successfully.' };
}

export async function deleteBank(userId: string, bankId: string) {
  const users = await readDb();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
      return { error: 'User not found.' };
  }

  const initialBankCount = users[userIndex].banks.length;
  users[userIndex].banks = users[userIndex].banks.filter((b) => b.id !== bankId);

  if (users[userIndex].banks.length === initialBankCount) {
      return { error: 'Bank not found.' };
  }

  await writeDb(users);
  revalidatePath('/');
  return { success: 'Bank deleted successfully.' };
}

export async function verifyMasterPassword(username: string, password: string) {
  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }
  const users = await readDb();
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

  // In a real app, use a secure password hashing library like bcrypt
  if (user && user.masterPassword === password) {
    // Return a copy of the user object without the sensitive data
    const { masterPassword, ...userToReturn } = user;
    return { success: 'Login successful.', user: userToReturn };
  }

  return { error: 'Invalid username or password.' };
}

export async function decryptBank(userId: string, bankId: string) {
  const users = await readDb();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { error: 'User not found.' };
  }

  const bank = user.banks.find((b) => b.id === bankId);
  if (!bank) {
    return { error: 'Bank not found.' };
  }
  
  const decryptedBank: Bank = {
    ...bank,
    netBankingPassword: bank.netBankingPassword ? decrypt(bank.netBankingPassword) : 'N/A',
    mobileBankingPassword: bank.mobileBankingPassword ? decrypt(bank.mobileBankingPassword) : 'N/A',
    atmPin: bank.atmPin ? decrypt(bank.atmPin) : 'N/A',
    customFields: bank.customFields?.map(field => ({
      ...field,
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

    const users = await readDb();

    const existingUser = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return { error: 'Username already taken.' };
    }

    const newUser: User = {
        id: randomUUID(),
        username: username,
        masterPassword: password, // In a real app, this should be securely hashed
        banks: [],
    };

    users.push(newUser);
    await writeDb(users);

    const { masterPassword, ...userToReturn } = newUser;

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
  const users = await readDb();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { error: 'User not found.' };
  }

  const user = users[userIndex];
  // In a real app, use a secure password hashing library like bcrypt
  if (user.masterPassword !== currentPassword) {
    return { error: 'Incorrect current password.' };
  }

  users[userIndex].masterPassword = newPassword;
  await writeDb(users);

  return { success: 'Master password updated successfully.' };
}
