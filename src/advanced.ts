import { verifyCredential, VerificationResult } from './index.js';
import { verifyMerkleProof } from './merkle.js';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

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
 * Supports 'did:iecc' method.
 */
export async function resolveDID(did: string): Promise<string | null> {
  if (!did.startsWith('did:iecc:')) return null;
  
  try {
    // In a production environment, this would call a distributed ledger or a secure resolver.
    // Here we simulate resolution via the trusted registry or a well-known endpoint.
    const response = await fetch(`https://verify.iecc.world/.well-known/did/${did.split(':').pop()}.json`);
    const doc = await response.json() as DIDDocument;
    return doc.verificationMethod[0].publicKeyHex;
  } catch {
    return null;
  }
}

/**
 * Enterprise-grade Batch Audit Tool
 */
export async function auditBatch(
  payloads: string[],
  signatures: string[],
  publicKeys: string[]
): Promise<VerificationResult[]> {
  return Promise.all(
    payloads.map((p, i) => verifyCredential(p, signatures[i], publicKeys[i]))
  );
}
