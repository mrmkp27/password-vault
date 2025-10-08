// lib/crypto.ts

// WARNING: In a real app, this key MUST be securely derived from the user's
// master password. It should NOT be hardcoded. We are hardcoding it here
// for simplicity of this tutorial.
const SECRET_KEY = 'your-super-secret-key-for-crypto';

// Function to get a usable crypto key from our secret string
async function getKey() {
  const encoded = new TextEncoder().encode(SECRET_KEY);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

// Function to encrypt data
export async function encryptData(data: string) {
  const key = await getKey();
  const encodedData = new TextEncoder().encode(data);
  // The IV must be unique for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );

  // We return the IV and the encrypted data, both converted to a string format
  return {
    iv: Buffer.from(iv).toString('base64'),
    content: Buffer.from(encryptedContent).toString('base64'),
  };
}

// Function to decrypt data
export async function decryptData(encryptedContent: string, iv: string) {
  const key = await getKey();
  const ivArray = Buffer.from(iv, 'base64');
  const contentArray = Buffer.from(encryptedContent, 'base64');

  const decryptedContent = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivArray },
    key,
    contentArray
  );

  return new TextDecoder().decode(decryptedContent);
}