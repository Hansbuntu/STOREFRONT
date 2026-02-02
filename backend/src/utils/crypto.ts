import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "changeme-storefront-key";

export function encryptField(value: any): string {
  const plaintext =
    typeof value === "string" ? value : JSON.stringify(value ?? null);
  return CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
}

export function decryptField(ciphertext: string): any {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch {
    return null;
  }
}


