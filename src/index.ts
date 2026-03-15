import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { getTrustedIssuers, type TrustedIssuer } from './trustedIssuers.js';
import canonize from 'json-canon';

// Security constants
const MAX_JSON_NESTING_DEPTH = 10;
const MAX_PAYLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Required for @noble/ed25519 to work in environments without global crypto
if (typeof crypto !== 'undefined' && !ed.etc.sha512Sync) {
  ed.etc.sha512Sync = (...messages: Uint8Array[]) => sha512(ed.etc.concatBytes(...messages));
}

export interface CredentialData {
  id: string;
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
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
 * Safely parse JSON with depth limit to prevent stack overflow attacks
 */
function safeJsonParse(rawPayload: string, maxDepth: number = MAX_JSON_NESTING_DEPTH): unknown {
  let depth = 0;
  const originalParse = JSON.parse;

  const proxy = new Proxy({}, {
    get: () => {
      depth++;
      if (depth > maxDepth) {
        throw new Error(`JSON nesting depth exceeds maximum (${maxDepth})`);
      }
      return undefined;
    }
  });

  try {
    return JSON.parse(rawPayload);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Validate credential data structure
 */
function validateCredentialData(data: unknown): asserts data is CredentialData {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Credential must be an object');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== 'string' || !obj.id.trim()) {
    throw new Error('Credential must have non-empty id');
  }
  if (typeof obj.issuer !== 'string' || !obj.issuer.trim()) {
    throw new Error('Credential must have non-empty issuer');
  }
  if (typeof obj.subject !== 'string' || !obj.subject.trim()) {
    throw new Error('Credential must have non-empty subject');
  }
  if (typeof obj.issuedAt !== 'number' || obj.issuedAt <= 0) {
    throw new Error('Credential must have valid issuedAt timestamp');
  }
  if (typeof obj.claims !== 'object' || obj.claims === null) {
    throw new Error('Credential must have claims object');
  }
}

/**
 * Validate signature format (64 hex characters for Ed25519)
 */
function validateSignatureFormat(signature: string): void {
  if (!/^[0-9a-f]{128}$/i.test(signature)) {
    throw new Error('Invalid signature format: must be 128 hex characters (64 bytes)');
  }
}

/**
 * Validate public key format (32 hex characters for Ed25519)
 */
function validatePublicKeyFormat(publicKey: string): void {
  if (!/^[0-9a-f]{64}$/i.test(publicKey)) {
    throw new Error('Invalid public key format: must be 64 hex characters (32 bytes)');
  }
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
    // Validate input format
    validateSignatureFormat(signatureHex);
    validatePublicKeyFormat(publicKeyHex);

    if (typeof rawPayload !== 'string' || rawPayload.length > MAX_PAYLOAD_SIZE_BYTES) {
      return { isValid: false, error: `Payload exceeds maximum size (${MAX_PAYLOAD_SIZE_BYTES} bytes)` };
    }

    // Safe JSON parsing
    const parsed = safeJsonParse(rawPayload);
    validateCredentialData(parsed);
    const data = parsed;

    // Cross-reference with trusted issuers
    const trustedIssuers = getTrustedIssuers();
    const issuerInfo = trustedIssuers.find(i => i.id === data.issuer);
    if (!issuerInfo) {
      return { isValid: false, error: 'Unknown or untrusted issuer ID' };
    }

    if (issuerInfo.status === 'revoked') {
      return { isValid: false, error: 'Issuer authority has been revoked' };
    }

    if (issuerInfo.status === 'suspended') {
      return { isValid: false, error: 'Issuer authority is temporarily suspended' };
    }

    if (issuerInfo.publicKey !== publicKeyHex) {
      return { isValid: false, error: 'Public key does not match registered issuer key' };
    }

    const canonicalPayload = canonize(parsed);
    const message = new TextEncoder().encode(canonicalPayload);
    const isValid = await ed.verify(signatureHex, message, publicKeyHex);

    if (!isValid) {
      return { isValid: false, error: 'Cryptographic signature mismatch' };
    }

    return {
      isValid: true,
      issuer: data.issuer,
      timestamp: data.issuedAt,
      data: data
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during verification';
    return {
      isValid: false,
      error: errorMessage
    };
  }
}

export { verifyMerkleProof, generateMerkleRoot } from './merkle.js';
export { resolveDID, auditBatch } from './advanced.js';
