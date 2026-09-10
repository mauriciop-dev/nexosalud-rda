
import crypto from 'crypto';

export interface DigitalSignature {
  hash: string;
  signature: string;
  timestamp: string;
  certificate_id: string;
}

export async function signDocument(payload: any, privateKey: string = 'simulated-private-key'): Promise<DigitalSignature> {
  // 1. Create a deterministic hash of the content (SHA-256)
  const contentString = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(contentString).digest('hex');
  
  // 2. Sign the hash with the private key (Simulated Asymmetric Encryption)
  // In production, this would use a hardware security module (HSM) or a certified provider
  const signer = crypto.createSign('SHA256');
  signer.update(contentString);
  const signature = signer.sign(privateKey, 'base64');

  return {
    hash,
    signature,
    timestamp: new Date().toISOString(),
    certificate_id: 'CERT-NEXO-2026-001-COL'
  };
}

export async function verifyDocument(payload: any, signature: DigitalSignature, publicKey: string = 'simulated-public-key'): Promise<boolean> {
  const contentString = JSON.stringify(payload);
  const verifier = crypto.createVerify('SHA256');
  verifier.update(contentString);
  return verifier.verify(publicKey, signature.signature, 'base64');
}
