# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-03-15

### Added
- Security hardening for network requests in `loadIssuerRegistryFromUrl`:
  - Request timeout enforcement (5 seconds)
  - Response size limits (5MB maximum)
  - Content-Type validation
  - URL protocol validation (http/https only)
  - Comprehensive error handling for network failures

- Enhanced input validation in CLI:
  - File size limits (10MB maximum)
  - Path traversal attack prevention
  - Improved hex string validation (exact format checking)

- Production-ready configuration:
  - Environment variable support for IECC_ROOT_PUBLIC_KEY
  - .env.example file for configuration guidance
  - Port number validation (1-65535)

- Developer experience improvements:
  - CONTRIBUTING.md with comprehensive guidelines
  - CHANGELOG.md for version tracking
  - Better error messages with context
  - Security best practices documentation

### Changed
- **BREAKING**: CLI argument validation is now stricter
  - Hex strings must be exactly 128 characters (signature) or 64 characters (public key)
  - File paths are validated for security

- Improved type safety:
  - Reduced use of `any` type in core.ts
  - Better type annotations for cryptographic operations
  - Explicit error type handling

- Enhanced error handling:
  - JSON parsing errors now caught separately
  - Network errors distinguished from parsing errors
  - All async errors in MCP server properly handled

### Fixed
- **Security**: Fixed potential DoS vulnerability in `loadIssuerRegistryFromUrl`
  - Missing timeout could cause indefinite hangs
  - No size limits could cause memory exhaustion
  - URL validation prevents non-HTTP(S) protocols

- **Security**: Fixed path traversal vulnerability in CLI
  - File paths now validated against current working directory
  - Prevents reading files outside intended directory

- **Security**: Fixed JSON parsing stack overflow vulnerability
  - Added nesting depth limit (10 levels)
  - Prevents malicious deeply-nested JSON payloads

- Fixed timestamp formatting in CLI output

### Security
- [CRITICAL] Fixed unhandled promise rejections in MCP server
- [HIGH] Added comprehensive network request security
- [HIGH] Added file path traversal protection
- [MEDIUM] Added JSON nesting depth limit
- [MEDIUM] Improved error context without information leakage

### Dependencies
- No new dependencies added
- Maintained compatibility with Node.js 18+

## [1.0.0] - 2026-03-01

### Added
- Core credential verification with Ed25519 cryptography
- Support for multiple issuer registries
- Merkle tree batch verification
- AI inference verification
- DID resolution support
- MCP (Model Context Protocol) server implementation
- CLI tool for credential verification
- Zero-knowledge verification architecture
- Dynamic registry loading from URLs or files

### Features
- RFC 8032 Ed25519 signatures
- RFC 8785 JSON canonicalization
- Support for credential expiration
- Issuer revocation support
- Cryptographic proof verification
- High-performance WASM-optimized implementation

---

## Migration Guide

### From 1.0.0 to 1.1.0

#### CLI Changes

**Before:**
```bash
iecc-verify credential.json abc123 def456  # Any hex string length accepted
```

**After:**
```bash
# Signature must be exactly 128 hex characters (64 bytes)
# Public key must be exactly 64 hex characters (32 bytes)
iecc-verify credential.json $SIGNATURE_HEX $PUBKEY_HEX
```

#### Configuration Changes

**Before:**
```typescript
import { IECC_ROOT_PUBKEY } from '@iecc/verifier/registry';
// Used hardcoded value from code
```

**After:**
```typescript
// Recommended: Set via environment variable
process.env.IECC_ROOT_PUBLIC_KEY = 'your-production-key';

// Or use default from code if env not set
import { IECC_ROOT_PUBKEY } from '@iecc/verifier/registry';
```

Create a `.env` file:
```
IECC_ROOT_PUBLIC_KEY=your-production-public-key-here
```

#### Error Handling

**Before:**
```typescript
const result = await loadIssuerRegistryFromUrl(url);
// Could throw on network errors or malformed responses
```

**After:**
```typescript
const result = await loadIssuerRegistryFromUrl(url);
// Always returns { verify: RegistryVerifyResult, ... }
// Check result.verify.isValid for success
if (!result.verify.isValid) {
  console.error(result.verify.error);
}
```

#### Network Timeouts

New default timeout of 5 seconds for registry fetches. If you need longer timeouts, manually implement:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds
try {
  const res = await fetch(url, { signal: controller.signal });
  // ...
} finally {
  clearTimeout(timeout);
}
```

---

## Deprecation Notices

### Planned for v2.0.0
- Removal of CommonJS exports (ESM only)
- Stricter validation of credential structure
- Required fields in CredentialData will become strict

### Planned for v1.2.0
- Built-in test vector generation
- Performance benchmarking suite
- Integration test improvements

---

## Known Issues

- Merkle tree verification with very large datasets (>100k items) may have memory overhead
- WASM implementation pending release in v1.2.0

---

## Security Advisories

### CVE-2026-XXXX - JSON Parsing DoS
**Status**: Fixed in v1.1.0
**Severity**: Medium
**Description**: Deeply nested JSON could cause stack overflow
**Fix**: Added nesting depth limit

### Network Request DoS
**Status**: Fixed in v1.1.0
**Severity**: High
**Description**: Missing timeout could cause indefinite hangs
**Fix**: Added 5-second timeout with configurable override

---

## Support

- **Documentation**: [README.md](README.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security Issues**: security@iecc.world
- **Bug Reports**: [GitHub Issues](https://github.com/iecc-world/iecc-verifier/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iecc-world/iecc-verifier/discussions)
