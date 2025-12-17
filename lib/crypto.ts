import crypto from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_LEN = 12

function getKey(): Buffer {
  const k = process.env.API_KEY_ENCRYPTION_KEY
  if (!k) throw new Error('API_KEY_ENCRYPTION_KEY is not set')
  // Expect a base64-encoded 32-byte key
  return Buffer.from(k, 'base64')
}

export function encryptText(plain: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Return base64 of iv|tag|encrypted
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptText(ciphertext: string): string {
  const key = getKey()
  const data = Buffer.from(ciphertext, 'base64')
  const iv = data.slice(0, IV_LEN)
  const tag = data.slice(IV_LEN, IV_LEN + 16)
  const encrypted = data.slice(IV_LEN + 16)
  const decipher = crypto.createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
