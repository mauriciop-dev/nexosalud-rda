
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'nexo-super-secret-key-2026';

export async function generateAccessToken(client_id: string) {
  return await new SignJWT({ client_id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch (e) {
    return null;
  }
}
