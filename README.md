# Lockbox - Personal Banking Credential Manager

A secure, modern web application for managing your personal banking credentials with AES-256 encryption. Built with Next.js 15, TypeScript, and Tailwind CSS.

## 🎯 Overview

Lockbox is a comprehensive personal banking credential management system that allows users to securely store, manage, and access their banking information. All sensitive data is encrypted using AES-256-CBC encryption before storage, ensuring your banking credentials remain protected.

## ✨ Features

### Security Features
- **AES-256 Encryption**: All sensitive banking data is encrypted using AES-256-CBC encryption before storage
- **Multi-user Support**: Create separate accounts for different users, each with their own master password
- **Secure Authentication**: User authentication with master password protection
- **OTP Verification**: Optional OTP (One-Time Password) verification for viewing bank details via Twilio SMS integration

### Banking Management
- **Add Bank Accounts**: Store multiple bank accounts with comprehensive details
- **Edit Bank Information**: Update bank credentials securely
- **Delete Banks**: Remove bank accounts with confirmation dialogs
- **View Bank Details**: Securely view decrypted bank information with OTP verification
- **Custom Fields**: Add custom fields for additional bank-specific information (SWIFT codes, routing numbers, etc.)

### User Features
- **User Registration**: Create new user accounts with unique usernames
- **Password Management**: Change master password securely
- **User Profile**: View and manage user information

### UI/UX Features
- **Dark Mode**: Switch between light, dark, and system themes
- **Responsive Design**: Fully responsive interface built with Tailwind CSS
- **Modern UI**: Built with ShadCN UI components for a polished, professional look
- **Toast Notifications**: User-friendly feedback for all actions
- **Loading States**: Visual feedback during data operations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **ShadCN UI** - High-quality React component library
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **next-themes** - Theme management

### Backend
- **Next.js Server Actions** - Server-side operations
- **Node.js Crypto** - Encryption/decryption
- **Twilio** (optional) - SMS OTP delivery

### Data Storage
- **JSON File Storage** - User data stored in `src/data/users.json`
  - Note: For production, consider migrating to a proper database

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- (Optional) Twilio account for SMS OTP functionality

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lockbox-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Encryption key (must be exactly 32 characters)
   ENCRYPTION_KEY=your-super-secret-32-character-key
   
   # Optional: Twilio credentials for SMS OTP
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

   **Important**: The `ENCRYPTION_KEY` must be exactly 32 characters long. Generate a strong, random key for production use.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Lockbox-main/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── banks/             # Bank-related components
│   │   │   ├── BankCard.tsx
│   │   │   ├── BankFormDialog.tsx
│   │   │   ├── BankList.tsx
│   │   │   ├── DeleteBankDialog.tsx
│   │   │   ├── DeleteConfirmationDialog.tsx
│   │   │   ├── OtpDialog.tsx
│   │   │   └── ViewBankDetailsDialog.tsx
│   │   ├── ui/                # ShadCN UI components
│   │   ├── ChangePasswordDialog.tsx
│   │   ├── Header.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SignUpDialog.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   ├── data/                  # Data storage
│   │   └── users.json        # User and bank data (encrypted)
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/                   # Core utilities
│       ├── actions.ts         # Server actions
│       ├── encryption.ts     # Encryption utilities
│       ├── otp.ts            # OTP generation and verification
│       ├── types.ts          # TypeScript types
│       └── utils.ts          # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🔐 Security Features

### Encryption
- All sensitive banking data (passwords, PINs, custom fields) is encrypted using AES-256-CBC
- Each encryption uses a unique initialization vector (IV) for enhanced security
- Encryption key is stored in environment variables (never in code)

### Data Protection
- Master passwords are stored in plain text (for demo purposes)
  - **Note**: In production, use bcrypt or similar for password hashing
- Bank credentials are never stored in plain text
- Decrypted data is only available in memory during viewing

### OTP Verification
- Optional OTP verification for viewing bank details
- OTPs expire after 5 minutes
- Single-use OTPs (deleted after successful verification)
- SMS delivery via Twilio (optional)

## 📝 Usage

### Creating an Account
1. Click "Sign Up" on the login screen
2. Enter a unique username (minimum 3 characters)
3. Enter a master password (minimum 8 characters)
4. Click "Create Account"

### Adding a Bank Account
1. Log in with your credentials
2. Click "Add Bank" in the header
3. Fill in the bank details:
   - Bank name
   - Phone number for OTP
   - Account number
   - Net banking username and password
   - Mobile banking username and password
   - ATM PIN (optional)
   - Custom fields (optional)
4. Click "Save"

### Viewing Bank Details
1. Click "View" on any bank card
2. Enter OTP if OTP verification is enabled
3. View decrypted bank information

### Editing a Bank Account
1. Click "Edit" on any bank card
2. Update the information
3. Click "Save"

### Deleting a Bank Account
1. Click "Delete" on any bank card
2. Confirm deletion in the dialog

### Changing Master Password
1. Click your username in the header
2. Select "Change Password"
3. Enter current password and new password
4. Confirm the new password

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## ⚠️ Important Notes

### Production Considerations

1. **Database Migration**: The current implementation uses JSON file storage. For production, migrate to a proper database (PostgreSQL, MongoDB, etc.)

2. **Password Hashing**: Master passwords are currently stored in plain text. Implement bcrypt or Argon2 for password hashing in production

3. **Encryption Key Management**: Use a proper secrets management system (AWS Secrets Manager, HashiCorp Vault, etc.) instead of environment variables

4. **HTTPS**: Always use HTTPS in production to protect data in transit

5. **Rate Limiting**: Implement rate limiting for login attempts and OTP generation

6. **Audit Logging**: Add logging for security events (login attempts, data access, etc.)

7. **Backup Strategy**: Implement regular backups of the data file/database

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Disclaimer**: This application is for educational and personal use. Ensure you comply with all applicable laws and regulations regarding data protection and privacy in your jurisdiction.

