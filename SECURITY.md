# Security Policy

## Reporting a Vulnerability

The IECC (International Evaluation and Certification Center) takes the security of our cryptographic infrastructure seriously. If you discover a security vulnerability, please do not open a public issue. Instead, send an email to security@iecc.world.

## Supported Versions

Only the latest version of the IECC Verifier is supported for security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Cryptographic Standards

- **Signature Scheme**: Ed25519 (RFC 8032)
- **Hashing**: SHA-512 (for EdDSA), SHA-256 (for Merkle Trees)
- **Key Storage**: We recommend that Issuers use Hardware Security Modules (HSM) or cloud-native KMS for private key management.

## Disclosure Process

1. Vulnerability reported via email.
2. Acknowledgement within 48 hours.
3. Fix developed and tested.
4. Coordinated public disclosure with credit to the researcher.
