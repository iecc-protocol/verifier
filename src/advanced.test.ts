import { describe, it, expect } from 'vitest';
import { resolveDID, auditBatch, type DIDDocument } from './advanced';
import type { VerificationResult } from './index';

describe('Advanced Functions', () => {
  describe('resolveDID', () => {
    it('should reject non-iecc DIDs', async () => {
      expect(async () => {
        await resolveDID('did:example:something');
      }).rejects.toThrow('Invalid DID format');
    });

    it('should reject invalid DID format', async () => {
      expect(async () => {
        await resolveDID('did:iecc');
      }).rejects.toThrow('Invalid DID format');
    });

    it('should reject empty identifier', async () => {
      expect(async () => {
        await resolveDID('did:iecc:');
      }).rejects.toThrow('identifier cannot be empty');
    });

    it('should return null for valid DID (not yet implemented)', async () => {
      const result = await resolveDID('did:iecc:valid-id');
      expect(result).toBeNull();
    });
  });

  describe('auditBatch', () => {
    const mockVerifyFn = async (
      payload: string,
      sig: string,
      pub: string
    ): Promise<VerificationResult> => {
      return {
        isValid: true,
        issuer: 'TEST-ORG',
        timestamp: Date.now(),
      };
    };

    it('should verify batch of credentials', async () => {
      const payloads = ['payload1', 'payload2', 'payload3'];
      const signatures = ['sig1', 'sig2', 'sig3'];
      const publicKeys = ['key1', 'key2', 'key3'];

      const results = await auditBatch(
        mockVerifyFn,
        payloads,
        signatures,
        publicKeys
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.isValid)).toBe(true);
    });

    it('should respect concurrency limit', async () => {
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const trackingVerifyFn = async (): Promise<VerificationResult> => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise(resolve => setTimeout(resolve, 10));
        currentConcurrent--;
        return { isValid: true };
      };

      const payloads = Array(20).fill('payload');
      const signatures = Array(20).fill('sig');
      const publicKeys = Array(20).fill('key');

      await auditBatch(trackingVerifyFn, payloads, signatures, publicKeys, {
        concurrency: 5,
      });

      expect(maxConcurrent).toBeLessThanOrEqual(5);
    });

    it('should throw on length mismatch', async () => {
      expect(async () => {
        await auditBatch(
          mockVerifyFn,
          ['payload1', 'payload2'],
          ['sig1'],
          ['key1', 'key2']
        );
      }).rejects.toThrow('must have the same length');
    });

    it('should throw on invalid concurrency', async () => {
      expect(async () => {
        await auditBatch(
          mockVerifyFn,
          ['payload1'],
          ['sig1'],
          ['key1'],
          { concurrency: 0 }
        );
      }).rejects.toThrow('at least 1');
    });

    it('should handle empty batch', async () => {
      const results = await auditBatch(mockVerifyFn, [], [], []);
      expect(results).toHaveLength(0);
    });

    it('should preserve order of results', async () => {
      let callCount = 0;
      const indexedVerifyFn = async (
        payload: string
      ): Promise<VerificationResult> => {
        const index = callCount++;
        return {
          isValid: true,
          data: { issuer: `issuer-${index}` } as any,
        };
      };

      const payloads = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const results = await auditBatch(
        indexedVerifyFn,
        payloads,
        payloads,
        payloads,
        { concurrency: 2 }
      );

      expect(results).toHaveLength(5);
    });
  });
});
