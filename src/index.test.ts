import { describe, it, expect, beforeEach } from 'vitest';
import { verifyCredential, type CredentialData } from './index';
import { setTrustedIssuer, resetTrustedIssuers } from './trustedIssuers';
import canonize from 'json-canon';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

describe('verifyCredential', () => {
  const testCredential: CredentialData = {
    id: 'CERT-123456',
    issuer: 'IECC-ORG-001',
    subject: 'Alice Smith',
    claims: { skill: 'LLM Engineering' },
    issuedAt: Date.now(),
  };

  const testPublicKey = 'e2b123f4567890abcdef1234567890abcdef1234567890abcdef1234567890ab';

  beforeEach(() => {
    resetTrustedIssuers();
  });

  it('should verify valid credential', async () => {
    const payload = JSON.stringify(testCredential);
    
    // Sign with test key (in production, this would come from issuer)
    const message = new TextEncoder().encode(canonize(testCredential));
    const signature = await ed.sign(message, testPublicKey);
    const signatureHex = signature.toString();

    const result = await verifyCredential(payload, signatureHex, testPublicKey);
    
    expect(result.isValid).toBe(true);
    expect(result.issuer).toBe(testCredential.issuer);
  });

  it('should reject invalid signature', async () => {
    const payload = JSON.stringify(testCredential);
    const invalidSignature = '00'.repeat(64);

    const result = await verifyCredential(payload, invalidSignature, testPublicKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('signature');
  });

  it('should reject malformed JSON', async () => {
    const result = await verifyCredential('{invalid json}', '00'.repeat(64), testPublicKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject missing required fields', async () => {
    const invalid = { id: 'CERT-123', issuer: 'IECC-ORG-001' };
    const result = await verifyCredential(
      JSON.stringify(invalid),
      '00'.repeat(64),
      testPublicKey
    );
    
    expect(result.isValid).toBe(false);
  });

  it('should reject invalid signature format', async () => {
    const payload = JSON.stringify(testCredential);
    
    const result = await verifyCredential(payload, 'invalid', testPublicKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('signature format');
  });

  it('should reject invalid public key format', async () => {
    const payload = JSON.stringify(testCredential);
    
    const result = await verifyCredential(payload, '00'.repeat(64), 'invalid');
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('public key format');
  });

  it('should reject unknown issuer', async () => {
    const credentialWithUnknownIssuer = {
      ...testCredential,
      issuer: 'UNKNOWN-ORG',
    };
    
    const payload = JSON.stringify(credentialWithUnknownIssuer);
    const result = await verifyCredential(payload, '00'.repeat(64), testPublicKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Unknown or untrusted issuer');
  });

  it('should reject revoked issuer', async () => {
    const credentialWithRevokedIssuer = {
      ...testCredential,
      issuer: 'IECC-ORG-999', // revoked
    };
    
    const payload = JSON.stringify(credentialWithRevokedIssuer);
    const result = await verifyCredential(payload, '00'.repeat(64), testPublicKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('revoked');
  });

  it('should reject oversized payload', async () => {
    const hugePayload = 'x'.repeat(11 * 1024 * 1024); // 11MB
    const result = await verifyCredential(hugePayload, '00'.repeat(64), testPublicKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceeds maximum size');
  });

  it('should reject deeply nested JSON', async () => {
    let nested: any = { test: true };
    for (let i = 0; i < 20; i++) {
      nested = { nested };
    }
    
    const result = await verifyCredential(
      JSON.stringify(nested),
      '00'.repeat(64),
      testPublicKey
    );
    
    expect(result.isValid).toBe(false);
  });

  it('should handle public key mismatch', async () => {
    const payload = JSON.stringify(testCredential);
    const wrongKey = 'a3f823f4567890abcdef1234567890abcdef1234567890abcdef1234567890bc';
    
    const result = await verifyCredential(payload, '00'.repeat(64), wrongKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('does not match');
  });
});
