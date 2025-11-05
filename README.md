# Lockbox - Personal Banking Login Manager

Lockbox is a secure application built with Next.js to help you manage your personal banking credentials.

## Features

- **Secure Credential Storage**: All your sensitive data is encrypted using AES-256.
- **Multi-user Support**: Create separate accounts for different users, each with their own master password.
- **Dynamic Credentials**: Add, edit, and delete bank details, including custom fields for extra information.
- **Dark Mode**: Switch between light, dark, and system themes.
- **User-friendly Interface**: Built with ShadCN UI components and Tailwind CSS for a modern and responsive experience.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root of your project and add an encryption key. This key must be exactly 32 characters long.
   ```
   ENCRYPTION_KEY=your-super-secret-32-character-key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start by creating a new account and adding your bank credentials.
