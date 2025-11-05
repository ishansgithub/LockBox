

export type CustomField = {
  label: string;
  value: string;
};

export type Bank = {
  id: string;
  bankName: string;
  phoneForOtp: string;
  accountNumber: string;
  netBankingUsername: string;
  netBankingPassword?: string;
  mobileBankingUsername: string;
  mobileBankingPassword?: string;
  atmPin?: string;
  customFields?: CustomField[];
};

export type BankFormValues = Omit<Bank, "id">;

export type BankListItem = Pick<Bank, "id" | "bankName" | "accountNumber">;

export type User = {
    id: string;
    username: string;
    masterPassword?: string; // This should not be sent to the client
    banks: Bank[];
}

export type ChangePasswordFormValues = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};
