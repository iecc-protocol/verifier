# IECC-2026-STD: Digital Credential Encapsulation Standard

## Abstract
This document defines the IECC-2026-STD protocol for the creation, signing, and verification of digital credentials. It aims to solve the "static PDF" problem by embedding cryptographic proofs directly into the credential metadata.

## 1. Core Cryptography
- **Signature Algorithm**: Ed25519 (Edwards-curve Digital Signature Algorithm).
- **Encoding**: Hexadecimal for signatures and public keys.
- **Canonicalization**: JSON payload must be deterministic (sorted keys, no whitespace) before hashing.

## 2. Payload Structure
A compliant IECC credential MUST contain:
- `id`: Unique identifier for the credential.
- `issuer`: Registered IECC Issuer ID.
- `subject`: Recipient identifier.
- `claims`: Key-value pairs of achievements.
- `issuedAt`: Unix timestamp.

## 3. Verification Workflow
1. Fetch Issuer Public Key from `trusted-issuers.json` or IECC Registry API.
2. Re-calculate SHA-512 hash of the canonicalized payload.
3. Verify Ed25519 signature against the hash using the Public Key.

## 4. SEO & Discoverability
Issuers are encouraged to host a `/.well-known/iecc-configuration` file on their root domain to allow for automated discovery of public keys.

---
Status: **Proposed Standard**  
Revision: **1.0.4**
