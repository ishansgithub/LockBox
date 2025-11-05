
import { Twilio } from 'twilio';

// In-memory store for OTPs. In a production app, use a persistent store like Redis.
const otpStore: Record<string, { code: string; expires: number }> = {};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Twilio credentials are not set in environment variables.');
}

const client = new Twilio(accountSid, authToken);

export async function generateOtp(bankId: string, userPhone: string): Promise<string> {
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    // In a real app, you'd have more robust error handling or a fallback.
    // For this simulation, we'll generate an OTP but won't send it via SMS
    // if credentials are not configured.
    console.warn("Twilio not configured. OTP will be generated but not sent via SMS.");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    otpStore[bankId] = { code, expires };
    return code;
  }
  
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  otpStore[bankId] = { code, expires };

  try {
    await client.messages.create({
      body: `Your SafeLock OTP is: ${code}`,
      from: twilioPhoneNumber,
      to: userPhone,
    });
    return code;
  } catch (error) {
    console.error("Failed to send OTP via Twilio:", error);
    // Re-throw the error to be handled by the caller
    throw new Error("Could not send OTP. Please check server logs.");
  }
}

export function verifyOtp(bankId: string, code: string): boolean {
  const storedOtp = otpStore[bankId];

  if (!storedOtp) {
    return false;
  }

  if (storedOtp.expires < Date.now()) {
    delete otpStore[bankId]; // Clean up expired OTP
    return false;
  }

  if (storedOtp.code === code) {
    delete otpStore[bankId]; // OTP is single-use
    return true;
  }

  return false;
}
