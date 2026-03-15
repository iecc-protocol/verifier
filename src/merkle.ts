import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';

export interface MerkleVerificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate hex string format
 */
function validateHexString(hex: string, expectedLength: number): void {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (!/^[0-9a-f]*$/i.test(cleaned)) {
    throw new Error('Invalid hex string format');
  }
  if (cleaned.length !== expectedLength) {
    throw new Error(`Expected ${expectedLength} hex characters, got ${cleaned.length}`);
  }
}

/**
 * IECC Merkle Proof Verification
 * Allows high-trust entities to verify a batch of certificates
 * against a publicly anchored Merkle Root.
 */
export function verifyMerkleProof(
  leaf: string,
  root: string,
  proof: string[]
): MerkleVerificationResult {
  try {
    // Validate inputs
    validateHexString(leaf, 64); // 32 bytes = 64 hex chars
    validateHexString(root, 64);
    proof.forEach((p, i) => {
      try {
        validateHexString(p, 64);
      } catch (err) {
        throw new Error(`Invalid proof[${i}]: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    });

    let acc = hexToBytes(leaf.startsWith('0x') ? leaf.slice(2) : leaf);
    
    for (const sib of proof) {
      const s = hexToBytes(sib.startsWith('0x') ? sib.slice(2) : sib);
      
      // Use consistent ordering: sort by hex string (like sorted tree)
      const accHex = bytesToHex(acc);
      const sibHex = bytesToHex(s);
      const [a, b] = accHex <= sibHex ? [acc, s] : [s, acc];
      
      const merged = new Uint8Array(a.length + b.length);
      merged.set(a, 0);
      merged.set(b, a.length);
      acc = sha256(merged);
    }
    
    const computed = bytesToHex(acc);
    const expected = (root.startsWith('0x') ? root.slice(2) : root).toLowerCase();
    
    return {
      isValid: computed.toLowerCase() === expected
    };
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Unknown error during Merkle verification'
    };
  }
}

/**
 * Generate a Merkle Root from a list of certificate hashes.
 * Used for daily anchoring to public platforms (GitHub/X/Nostr).
 */
export function generateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '';
  
  try {
    let level = hashes.map((h, i) => {
      try {
        validateHexString(h, 64);
        return hexToBytes(h.startsWith('0x') ? h.slice(2) : h);
      } catch (err) {
        throw new Error(`Invalid hash[${i}]: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    });

    while (level.length > 1) {
      const next: Uint8Array[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] ?? left; // Duplicate last if odd number
        
        // Consistent ordering
        const leftHex = bytesToHex(left);
        const rightHex = bytesToHex(right);
        const [a, b] = leftHex <= rightHex ? [left, right] : [right, left];
        
        const merged = new Uint8Array(a.length + b.length);
        merged.set(a, 0);
        merged.set(b, a.length);
        next.push(sha256(merged));
      }
      level = next;
    }

    return bytesToHex(level[0]);
  } catch (err) {
    throw err;
  }
}
