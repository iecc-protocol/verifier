# IECC Verifier (Open Source Trust Protocol)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cryptographic Standard: Ed25519](https://img.shields.io/badge/Security-Ed25519-blue.svg)](#technical-specifications)
[![Audit: Open Source](https://img.shields.io/badge/Audit-Public-success.svg)](#why-this-exists)

The IECC Verifier is a lightweight, client-side cryptographic tool designed to validate **digital credentials**, **professional certificates**, and **verifiable achievements** issued through the [IECC (International Evaluation and Certification Center)](https://iecc.world) network. 

## Key Use Cases

- **Employment Verification**: Instantly validate candidate certifications without manual background checks.
- **Academic Integrity**: Secure digital diplomas that are immune to PDF manipulation.
- **Skill Badges**: Cryptographically-signed badges for open-source contributors and technical professionals.
- **Compliance Auditing**: Automated verification of regulatory licenses and mandatory training.

## Overview

In an era of digital forgery, static PDFs are no longer sufficient for professional certification. IECC implements a "Trust-by-Design" architecture where every credential carries a unique cryptographic fingerprint. This repository contains the reference implementation for verifying these signatures.

## Key Features

- **Zero-Knowledge Verification**: Validate credentials without accessing central databases.
- **Ed25519 Signature Scheme**: Industry-standard Edwards-curve Digital Signature Algorithm for high security and performance.
- **SHA-256 Integrity**: Ensures the certificate content hasn't been tampered with.
- **Portable & Lightweight**: No heavy dependencies, runs in any modern browser or Node.js environment.

## How it Works

1. **Hashing**: The verifier computes the SHA-256 hash of the credential data.
2. **Signature Check**: It uses the IECC Public Key to verify the Ed25519 signature against the computed hash.
3. **Audit Trail**: Returns the timestamp and issuer metadata embedded in the signature packet.

## Integration Guide

### 1. Installation
```bash
npm install @iecc/verifier
```

### 2. Basic Verification
Ensure you have the raw payload (exactly as issued), the hex signature, and the issuer's public key.

```typescript
import { verifyCredential } from '@iecc/verifier';

const payload = '{"id":"CERT-123","issuer":"IECC-ORG-1",...}';
const signature = 'a3f8...';
const publicKey = 'e2b1...';

const { isValid, data, error } = await verifyCredential(payload, signature, publicKey);

if (isValid) {
  console.log(`Verified achievement: ${data.claims.achievement}`);
} else {
  console.error(`Trust Failure: ${error}`);
}
```

### 3. Command Line Interface (CLI)
For dev-ops and batch auditing:
```bash
npx iecc-verify ./cert.json <signature> <pubkey>
```

---

## Technical Specifications

- **Curve**: Ed25519 (Edwards25519)
- **Hash Algorithm**: SHA-512 (Internal to EdDSA)
- **Payload Standard**: JSON-canonicalization-ready

## Why this exists?

Most "digital certificates" are just entries in a private database. If the company goes bust, the certificate is worthless. **IECC** changes the paradigm: we provide the infrastructure to issue credentials, but the **proof** belongs to the individual. By open-sourcing this verifier, we ensure that any third party (employers, governments, universities) can independently verify a credential without ever talking to our servers.

Trust is built on transparency, not proprietary algorithms.
