import type { VerificationResult } from './index.js';

export interface DIDDocument {
  id: string;
  verificationMethod: {
    id: string;
    type: string;
    controller: string;
    publicKeyHex: string;
  }[];
}

/**
 * Resolves a DID (Decentralized Identifier) to a Public Key.
 * Supports 'did:iecc' method with HTTP(S) resolution.
 */
export async function resolveDID(did: string): Promise<string | null> {
  if (!did.startsWith('did:iecc:')) {
    throw new Error('Invalid DID format: must start with "did:iecc:"');
  }

  // Extract the identifier part: did:iecc:example-id
  const parts = did.split(':');
  if (parts.length < 3) {
    throw new Error('Invalid DID format: did:iecc:identifier');
  }

  const identifier = parts[2];
  if (!identifier.trim()) {
    throw new Error('DID identifier cannot be empty');
  }

  // TODO: Implement DID resolver
  // For now, return null (not supported in v1.0)
  return null;
}

/**
 * Batch audit with concurrency control
 * Prevents memory overflow by limiting concurrent verifications
 */
export async function auditBatch(
  verifyFn: (payload: string, sig: string, pub: string) => Promise<VerificationResult>,
  payloads: string[],
  signatures: string[],
  publicKeys: string[],
  options?: { concurrency?: number }
): Promise<VerificationResult[]> {
  const concurrency = options?.concurrency ?? 10;
  
  if (payloads.length !== signatures.length || payloads.length !== publicKeys.length) {
    throw new Error('Payloads, signatures, and publicKeys must have the same length');
  }

  if (concurrency < 1) {
    throw new Error('Concurrency must be at least 1');
  }

  const results: VerificationResult[] = [];

  for (let i = 0; i < payloads.length; i += concurrency) {
    const batch = payloads.slice(i, i + concurrency);
    const batchSigs = signatures.slice(i, i + concurrency);
    const batchKeys = publicKeys.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map((payload, j) => verifyFn(payload, batchSigs[j], batchKeys[j]))
    );

    results.push(...batchResults);
  }

  return results;
}
