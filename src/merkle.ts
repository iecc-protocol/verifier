import { sha256 } from '@noble/hashes/sha256';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';

/**
 * IECC Merkle Proof Verification
 * Allows high-trust entities to verify a batch of certificates
 * against a publicly anchored Merkle Root.
 */
export function verifyMerkleProof(
  leaf: string,
  root: string,
  proof: string[]
): boolean {
  try {
    let acc = hexToBytes(leaf.startsWith('0x') ? leaf.slice(2) : leaf);
    for (const sib of proof) {
      const s = hexToBytes(sib.startsWith('0x') ? sib.slice(2) : sib);
      const [a, b] = bytesToHex(acc) <= bytesToHex(s) ? [acc, s] : [s, acc];
      const merged = new Uint8Array(a.length + b.length);
      merged.set(a, 0);
      merged.set(b, a.length);
      acc = sha256(merged);
    }
    const computed = bytesToHex(acc);
    const expected = (root.startsWith('0x') ? root.slice(2) : root).toLowerCase();
    return computed.toLowerCase() === expected;
  } catch (err) {
    return false;
  }
}

/**
 * Generate a Merkle Root from a list of certificate hashes.
 * Used for daily anchoring to public platforms (GitHub/X/Nostr).
 */
export function generateMerkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '';
  let level = hashes.map(h => hexToBytes(h.startsWith('0x') ? h.slice(2) : h));
  while (level.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? level[i];
      const [a, b] = bytesToHex(left) <= bytesToHex(right) ? [left, right] : [right, left];
      const merged = new Uint8Array(a.length + b.length);
      merged.set(a, 0);
      merged.set(b, a.length);
      next.push(sha256(merged));
    }
    level = next;
  }
  return bytesToHex(level[0]);
}
