import { MerkleTree } from 'merkletreejs';
import { sha256 } from '@noble/hashes/sha256';

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
    const tree = new MerkleTree([], (m) => sha256(m), { sortPairs: true });
    return tree.verify(proof, leaf, root);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a Merkle Root from a list of certificate hashes.
 * Used for daily anchoring to public platforms (GitHub/X/Nostr).
 */
export function generateMerkleRoot(hashes: string[]): string {
  const leaves = hashes.map(h => Buffer.from(h, 'hex'));
  const tree = new MerkleTree(leaves, (m) => sha256(m), { sortPairs: true });
  return tree.getHexRoot();
}
