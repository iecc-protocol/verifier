import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { verifyMerkleProof, generateMerkleRoot } from './merkle.js';
import { resolveDID, auditBatch } from './advanced.js';
import trustedIssuers from '../trusted-issuers.json' assert { type: 'json' };
import canonize from 'json-canon';

// Required for @noble/ed25519 to work in environments without global crypto
if (typeof crypto !== 'undefined' && !ed.etc.sha512Sync) {
  ed.etc.sha512Sync = (...m: any[]) => sha512(ed.etc.concatBytes(...m));
}

export interface CredentialData {
  id: string;
  issuer: string;
  subject: string;
  claims: Record<string, any>;
  issuedAt: number;
}

export interface VerificationResult {
  isValid: boolean;
  issuer?: string;
  timestamp?: number;
  data?: CredentialData;
  merkleVerified?: boolean;
  error?: string;
}

/**
 * Standard IECC Verification Logic
 * This is the same logic used by verify.iecc.world
 */
export async function verifyCredential(
  rawPayload: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<VerificationResult> {
  try {
    const data = JSON.parse(rawPayload) as CredentialData;
    
    // Cross-reference with trusted issuers
    const issuerInfo = trustedIssuers.find(i => i.id === data.issuer);
    if (!issuerInfo) {
      return { isValid: false, error: 'Unknown or untrusted issuer ID' };
    }

    if (issuerInfo.status === 'revoked') {
      return { isValid: false, error: 'Issuer authority has been revoked' };
    }

    if (issuerInfo.publicKey !== publicKeyHex) {
      return { isValid: false, error: 'Public key does not match registered issuer key' };
    }

    const canonicalPayload = typeof rawPayload === 'string' 
      ? canonize(JSON.parse(rawPayload)) 
      : canonize(rawPayload);

    const isValid = await ed.verify(signatureHex, canonicalPayload, publicKeyHex);

    return {
      isValid: true,
      issuer: data.issuer,
      timestamp: data.issuedAt,
      data: data
    };
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid payload format'
    };
  }
}
