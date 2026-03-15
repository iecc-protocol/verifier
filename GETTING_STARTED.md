# Getting Started with IECC Verifier

**Version**: 1.1.0  
**Last Updated**: March 15, 2026

---

## 📖 Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Verifying Credentials](#verifying-credentials)
4. [Advanced Features](#advanced-features)
5. [FAQ](#faq)
6. [Troubleshooting](#troubleshooting)

---

## Installation

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **TypeScript**: 5.0.0 or higher (if using TypeScript)

### Installation Steps

```bash
# 1. Install via NPM
npm install @iecc/verifier@1.1.0

# 2. Verify Installation
npm list @iecc/verifier
# @iecc/verifier@1.1.0

# 3. Check CLI Tool
npx iecc-verify --help
```

### Configuration

Create a `.env` file (optional):

```env
# Set Root Public Key
IECC_ROOT_PUBLIC_KEY=your-root-pubkey-here

# CLI Default Timeout (ms)
IECC_CLI_TIMEOUT=5000
```

---

## Basic Usage

### JavaScript Usage

```javascript
const { verifyCredential } = require('@iecc/verifier');

async function verify() {
  const credential = {
    id: "CERT-001",
    issuer: "IECC-ORG-001",
    subject: "John Doe",
    claims: { skill: "TypeScript" },
    issuedAt: Date.now(),
  };

  const result = await verifyCredential(
    JSON.stringify(credential),
    "a1b2c3...", // Signature (128 hex characters)
    "d4e5f6..."  // Public Key (64 hex characters)
  );

  console.log(result);
  // {
  //   isValid: true,
  //   issuer: "IECC-ORG-001",
  //   timestamp: 1234567890,
  //   data: { ... }
  // }
}

verify().catch(console.error);
```

### TypeScript Usage

```typescript
import { verifyCredential, type VerificationResult } from '@iecc/verifier';

interface Certificate {
  id: string;
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
  issuedAt: number;
}

async function verifyCertificate(
  cert: Certificate,
  signature: string,
  publicKey: string
): Promise<VerificationResult> {
  return await verifyCredential(
    JSON.stringify(cert),
    signature,
    publicKey
  );
}

// Usage
const cert: Certificate = {
  id: "CERT-001",
  issuer: "IECC-ORG-001",
  subject: "Jane Smith",
  claims: { role: "Engineer", level: "Senior" },
  issuedAt: Date.now(),
};

const result = await verifyCertificate(cert, sig, key);
if (result.isValid) {
  console.log(`✅ Verification Success: ${result.issuer}`);
} else {
  console.log(`❌ Verification Failed: ${result.error}`);
}
```

---

## Verifying Credentials

### Credential Format

Credentials must comply with the following format:

```typescript
interface CredentialData {
  id: string;                    // Unique identifier
  issuer: string;                // Issuer ID
  subject: string;               // Subject (holder)
  claims: Record<string, unknown>; // Claim data
  issuedAt: number;              // Issuance timestamp
}
```

### Signature Format

- **Signature Format**: 128 hex characters (64-byte Ed25519 signature). **Note:** Do not include the `0x` prefix.
- **Public Key Format**: 64 hex characters (32-byte Ed25519 public key). **Note:** Do not include the `0x` prefix.

### Example: Full Verification Flow

```typescript
import { verifyCredential, getTrustedIssuers } from '@iecc/verifier';

async function fullVerificationFlow() {
  // 1. Prepare credential
  const credential = {
    id: "CERT-2024-001",
    issuer: "IECC-ORG-001",
    subject: "Alice Johnson",
    claims: {
      course: "Advanced TypeScript",
      score: 95,
      completion_date: "2024-03-15"
    },
    issuedAt: Date.now(),
  };

  const payload = JSON.stringify(credential);
  const signature = "a1b2c3d4e5f6..."; // 128 hex chars
  const publicKey = "d4e5f6g7h8...";   // 64 hex chars

  // 2. Verify signature
  const result = await verifyCredential(payload, signature, publicKey);

  // 3. Check results
  if (!result.isValid) {
    console.error(`❌ Verification Failed: ${result.error}`);
    return null;
  }

  // 4. Check if issuer is trusted
  const trustedIssuers = getTrustedIssuers();
  const issuerInfo = trustedIssuers.find(i => i.id === result.issuer);
  
  if (!issuerInfo) {
    console.error("❌ Issuer is not trusted");
    return null;
  }

  if (issuerInfo.status === 'revoked') {
    console.error("❌ Issuer has been revoked");
    return null;
  }

  // 5. Success!
  console.log(`✅ Credential Verified`);
  console.log(`   Issuer: ${result.issuer}`);
  console.log(`   Subject: ${result.data?.subject}`);
  console.log(`   Time: ${new Date(result.timestamp!)}`);

  return result.data;
}
```

---

## Advanced Features

### 1. Batch Verification

```typescript
import { auditBatch, verifyCredential } from '@iecc/verifier';

async function batchVerify() {
  const credentials = [
    { id: "1", issuer: "IECC-ORG-001", ... },
    { id: "2", issuer: "IECC-ORG-001", ... },
    { id: "3", issuer: "IECC-ORG-002", ... },
  ];

  const results = await auditBatch(
    verifyCredential,
    credentials.map(c => JSON.stringify(c)),
    ["sig1", "sig2", "sig3"],
    ["key1", "key1", "key2"],
    { concurrency: 5 }  // Up to 5 concurrent
  );

  const validCount = results.filter(r => r.isValid).length;
  console.log(`Verification completed: ${validCount}/${results.length} success`);

  return results;
}
```

### 2. Dynamic Loading of Issuers

```typescript
import { 
  loadTrustedIssuers, 
  getTrustedIssuers,
  setTrustedIssuer 
} from '@iecc/verifier';

// Load from remote URL
async function loadIssuers() {
  try {
    const issuers = await loadTrustedIssuers(
      'https://registry.iecc.world/issuers.json',
      { timeout: 5000 }
    );
    console.log(`✅ Loaded ${issuers.length} issuers`);
  } catch (err) {
    console.error(`❌ Load failed: ${err}`);
  }
}

// Add custom issuer (for testing)
function addCustomIssuer() {
  setTrustedIssuer({
    id: 'TEST-ORG-001',
    name: 'Test Organization',
    website: 'https://test.example.com',
    publicKey: 'a'.repeat(64),
    status: 'active'
  });
}

// List all issuers
function listIssuers() {
  const issuers = getTrustedIssuers();
  issuers.forEach(issuer => {
    console.log(`${issuer.id}: ${issuer.status}`);
  });
}
```

### 3. Merkle Tree Verification

```typescript
import { verifyMerkleProof, generateMerkleRoot } from '@iecc/verifier';

// Generate Merkle Root
function createMerkleRoot() {
  const hashes = [
    'a'.repeat(64),
    'b'.repeat(64),
    'c'.repeat(64),
  ];

  const root = generateMerkleRoot(hashes);
  console.log(`Root Hash: ${root}`);
  return root;
}

// Verify Merkle Proof
function verifyProof() {
  const leaf = 'a'.repeat(64);
  const root = 'xyz...'; // Merkle Root
  const proof = ['p1', 'p2', 'p3']; // Proof path

  const result = verifyMerkleProof(leaf, root, proof);
  
  if (result.isValid) {
    console.log("✅ Merkle proof is valid");
  } else {
    console.log(`❌ Verification failed: ${result.error}`);
  }
}
```

---

## CLI Tool

### Basic Usage

```bash
# Verify a single credential file
iecc-verify credential.json signature_hex public_key_hex

# Example
iecc-verify cert.json a1b2c3d4... d4e5f6g7...
```

### Output

```
✓ Credential Verified
--------------------------
Issuer:    IECC-ORG-001
Issued At: 2026/3/15 10:30:45
Subject:   John Doe
```

### Error Handling

```bash
# File does not exist
$ iecc-verify missing.json sig key
Error: File not found at /path/to/missing.json

# Invalid signature format
$ iecc-verify cert.json invalid_sig key
Error: Invalid signature format: must be 128 hex characters (64 bytes)

# Verification failed
$ iecc-verify cert.json sig key
✗ Verification Failed
Reason: Cryptographic signature mismatch
```

---

## FAQ

### Q: What is the signature format?
**A**: Ed25519 signature (64 bytes) represented as 128 hex characters. We recommend not using the `0x` prefix to maintain consistency with Ed25519 standard encoding.

### Q: How to generate an Ed25519 key pair?
**A**: Using `@noble/ed25519`:
```typescript
import * as ed from '@noble/ed25519';

const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKey(privateKey);
```

### Q: Which Node.js versions are supported?
**A**: 18.0.0 or higher. Using the latest LTS version is recommended.

### Q: Is there a limit on credential size?
**A**: Yes, maximum 10MB. This is to prevent memory overflow attacks.

### Q: Is browser usage supported?
**A**: Yes. It can be used via bundlers (webpack, vite). The ESM version is recommended.

### Q: How to handle offline verification?
**A**: Pre-load the issuer list, then verify offline. No network connection is required.

### Q: Is it GDPR compliant?
**A**: Yes. No central database is stored, completely peer-to-peer verification.

---

## Troubleshooting

### Issue 1: "Issuer not found"

```
❌ Verification Failed
Reason: Unknown or untrusted issuer ID
```

**Solution**:
```typescript
// Load the latest issuer list
await loadTrustedIssuers('https://registry.example.com/issuers.json');

// Or add manually
setTrustedIssuer({
  id: 'IECC-ORG-001',
  name: 'Example Org',
  website: 'https://example.com',
  publicKey: 'abc123...',
  status: 'active'
});
```

### Issue 2: "Cryptographic signature mismatch"

**Cause**: Invalid signature or public key mismatch

**Solution**:
1. Check signature format (128 hex characters)
2. Check public key format (64 hex characters)
3. Ensure the correct public key is used
4. Verify the credential JSON has not been modified

### Issue 3: "Invalid JSON nesting depth"

**Cause**: JSON nesting depth exceeds limit (max 10 layers)

**Solution**:
```typescript
// Simplify your credential structure
// ❌ Too deep
{
  level1: { level2: { level3: { ... } } }
}

// ✅ Flat structure
{
  data: { key: value }
}
```

### Issue 4: "File too large"

**Cause**: Credential file exceeds 10MB

**Solution**: Split large files or use batch processing

---

## Next Steps

- 📖 Check the [API Reference](./README.md#-api-reference)
- 🧪 Run Tests: `npm test`
- 🛠️ Contribute: See [CONTRIBUTING.md](./CONTRIBUTING.md)
- 🔐 Security Policy: See [SECURITY.md](./SECURITY.md)

---

**Need help?** Submit an issue to [GitHub Issues](https://github.com/iecc-protocol/verifier/issues)
