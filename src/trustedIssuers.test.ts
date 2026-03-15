import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTrustedIssuers,
  setTrustedIssuer,
  resetTrustedIssuers,
  type TrustedIssuer,
} from './trustedIssuers';

describe('Trusted Issuers', () => {
  beforeEach(() => {
    resetTrustedIssuers();
  });

  describe('getTrustedIssuers', () => {
    it('should return default issuers', () => {
      const issuers = getTrustedIssuers();
      
      expect(issuers.length).toBeGreaterThan(0);
      expect(issuers[0]).toHaveProperty('id');
      expect(issuers[0]).toHaveProperty('publicKey');
    });

    it('should return a copy, not reference', () => {
      const issuers1 = getTrustedIssuers();
      const issuers2 = getTrustedIssuers();
      
      expect(issuers1).not.toBe(issuers2);
      expect(issuers1).toEqual(issuers2);
    });

    it('should have active and revoked issuers', () => {
      const issuers = getTrustedIssuers();
      const active = issuers.filter(i => i.status === 'active');
      const revoked = issuers.filter(i => i.status === 'revoked');
      
      expect(active.length).toBeGreaterThan(0);
      expect(revoked.length).toBeGreaterThan(0);
    });
  });

  describe('setTrustedIssuer', () => {
    it('should add new issuer', () => {
      const newIssuer: TrustedIssuer = {
        id: 'TEST-ORG-001',
        name: 'Test Org',
        website: 'https://test.com',
        publicKey: 'f'.repeat(64),
        status: 'active',
      };
      
      setTrustedIssuer(newIssuer);
      const issuers = getTrustedIssuers();
      const found = issuers.find(i => i.id === 'TEST-ORG-001');
      
      expect(found).toEqual(newIssuer);
    });

    it('should update existing issuer', () => {
      const issuers = getTrustedIssuers();
      const originalId = issuers[0].id;
      
      const updated = {
        ...issuers[0],
        status: 'suspended' as const,
      };
      
      setTrustedIssuer(updated);
      const result = getTrustedIssuers().find(i => i.id === originalId);
      
      expect(result?.status).toBe('suspended');
    });
  });

  describe('resetTrustedIssuers', () => {
    it('should reset to default issuers', () => {
      const newIssuer: TrustedIssuer = {
        id: 'TEMP-ORG',
        name: 'Temporary',
        website: 'https://temp.com',
        publicKey: '1'.repeat(64),
        status: 'active',
      };
      
      setTrustedIssuer(newIssuer);
      expect(getTrustedIssuers().find(i => i.id === 'TEMP-ORG')).toBeDefined();
      
      resetTrustedIssuers();
      expect(getTrustedIssuers().find(i => i.id === 'TEMP-ORG')).toBeUndefined();
    });
  });
});
