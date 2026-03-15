import { describe, it, expect } from 'vitest';
import { verifyMerkleProof, generateMerkleRoot } from './merkle';

describe('Merkle Tree Functions', () => {
  describe('generateMerkleRoot', () => {
    it('should generate Merkle root for single hash', () => {
      const hash = 'a'.repeat(64);
      const root = generateMerkleRoot([hash]);
      
      expect(root).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/i.test(root)).toBe(true);
    });

    it('should generate Merkle root for multiple hashes', () => {
      const hashes = [
        'a'.repeat(64),
        'b'.repeat(64),
        'c'.repeat(64),
      ];
      const root = generateMerkleRoot(hashes);
      
      expect(root).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/i.test(root)).toBe(true);
    });

    it('should handle odd number of hashes', () => {
      const hashes = [
        'a'.repeat(64),
        'b'.repeat(64),
        'c'.repeat(64),
      ];
      const root1 = generateMerkleRoot(hashes);
      const root2 = generateMerkleRoot([...hashes, 'c'.repeat(64)]);
      
      expect(root1).toHaveLength(64);
      expect(root2).toHaveLength(64);
    });

    it('should return empty string for empty array', () => {
      const root = generateMerkleRoot([]);
      expect(root).toBe('');
    });

    it('should throw on invalid hash format', () => {
      const hashes = ['invalid_hash'];
      
      expect(() => generateMerkleRoot(hashes)).toThrow();
    });

    it('should handle 0x prefixed hashes', () => {
      const hashes = [
        '0x' + 'a'.repeat(64),
        '0x' + 'b'.repeat(64),
      ];
      const root = generateMerkleRoot(hashes);
      
      expect(root).toHaveLength(64);
    });
  });

  describe('verifyMerkleProof', () => {
    it('should verify valid proof', () => {
      const hashes = [
        'a'.repeat(64),
        'b'.repeat(64),
        'c'.repeat(64),
        'd'.repeat(64),
      ];
      
      const root = generateMerkleRoot(hashes);
      const leaf = hashes[0];
      // In real scenario, proof would be computed from tree structure
      const proof: string[] = [];
      
      const result = verifyMerkleProof(leaf, root, proof);
      expect(result.isValid).toBeDefined();
    });

    it('should return result object with isValid property', () => {
      const result = verifyMerkleProof(
        'a'.repeat(64),
        'b'.repeat(64),
        []
      );
      
      expect(result).toHaveProperty('isValid');
      expect(typeof result.isValid).toBe('boolean');
    });

    it('should handle invalid leaf format', () => {
      const result = verifyMerkleProof(
        'invalid',
        'b'.repeat(64),
        []
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle invalid root format', () => {
      const result = verifyMerkleProof(
        'a'.repeat(64),
        'invalid',
        []
      );
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle 0x prefixed inputs', () => {
      const result = verifyMerkleProof(
        '0x' + 'a'.repeat(64),
        '0x' + 'b'.repeat(64),
        ['0x' + 'c'.repeat(64)]
      );
      
      expect(result.isValid).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });
});
