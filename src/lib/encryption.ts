
import crypto from 'crypto';

// IMPORTANT: In a production application, these values should be stored securely in environment variables
// and managed through a proper secrets management system.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a3K8B6c9D2eF5gH1jL4mN7pS9tVwY2z$'; // Must be 32 bytes for AES-256
const IV_LENGTH = 16; // For AES, this is always 16

if (ENCRYPTION_KEY && ENCRYPTION_KEY.length !== 32) {
  // Only validate if the key is present
  throw new Error('Invalid ENCRYPTION_KEY length. Must be 32 bytes.');
}

const key = Buffer.from(ENCRYPTION_KEY, 'utf-8');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  try {
    const textParts = text.split(':');
    const ivString = textParts.shift();
    if (!ivString) {
      throw new Error('Invalid encrypted text format: IV is missing.');
    }
    const iv = Buffer.from(ivString, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Decryption Error";
  }
}
