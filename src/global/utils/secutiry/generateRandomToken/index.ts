import { randomBytes } from 'crypto';

export function generateRandomToken() {
  return randomBytes(20).toString('hex');
}
