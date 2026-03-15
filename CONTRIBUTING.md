# Contributing to IECC Verifier

Thank you for your interest in contributing to the IECC Verifier project! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment.

## Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/iecc-world/iecc-verifier.git
cd iecc-verifier

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

When writing tests, please ensure:
1. **Use real cryptographic data**: Don't use fake signatures in verification tests
2. **Test both success and failure paths**: Include tests for error conditions
3. **Test edge cases**: Empty inputs, oversized inputs, malformed data
4. **Document test vectors**: Include comments explaining what each test validates

Example test with real signatures:
```typescript
import { describe, it, expect } from 'vitest';
import { verifyCredential } from '../src/index';
import * as ed from '@noble/ed25519';
import canonize from 'json-canon';

describe('Credential Verification with Real Signatures', () => {
  it('should verify a validly signed credential', async () => {
    // 1. Create test credential
    const credential = {
      id: 'CERT-001',
      issuer: 'IECC-ORG-001',
      subject: 'Test Subject',
      claims: { course: 'Test Course' },
      issuedAt: Math.floor(Date.now() / 1000)
    };

    // 2. Generate real signature
    const privateKey = 'your-test-private-key-hex'; // Use test key
    const canonicalPayload = canonize(credential);
    const message = new TextEncoder().encode(canonicalPayload);
    const signatureBytes = await ed.sign(message, privateKey);
    const signature = bytesToHex(signatureBytes);

    // 3. Verify
    const result = await verifyCredential(
      JSON.stringify(credential),
      signature,
      publicKeyHex
    );

    expect(result.isValid).toBe(true);
  });
});
```

## Security Testing

When modifying security-sensitive code:

1. **Test with adversarial inputs**: Try to break the validation
2. **Test boundary conditions**: Maximum/minimum values
3. **Test type confusion**: Unexpected data types
4. **Test resource exhaustion**: Large inputs

```bash
# Check for security vulnerabilities
npm audit

# Type check
npx tsc --noEmit
```

## Code Style

We use ESLint for code style. Please run:

```bash
npm run lint
npm run lint -- --fix  # Auto-fix issues
```

### Code Style Guidelines

- Use TypeScript strictly (no `any` types without good reason)
- Use meaningful variable names
- Add JSDoc comments for public functions
- Handle all error cases explicitly
- Validate all external inputs

## Cryptography Best Practices

When working with cryptographic code:

1. **Never hardcode production keys** in source code
2. **Use environment variables or KMS** for key management
3. **Test with known test vectors** from standards
4. **Don't implement custom crypto** - use battle-tested libraries
5. **Validate all inputs** before cryptographic operations
6. **Use constant-time comparisons** for sensitive data
7. **Include security notes** in code comments

## Documentation

### Updating Documentation

- Update README.md if adding new features
- Add JSDoc comments for public APIs
- Include usage examples in documentation
- Document breaking changes in CHANGELOG.md

### Creating Test Vectors

For security-sensitive functionality, create test vector files:

```json
{
  "description": "Valid credential signature",
  "credential": { /* credential data */ },
  "signature": "hex-encoded-signature",
  "publicKey": "hex-encoded-public-key",
  "expected": true
}
```

## Performance Considerations

- Profile cryptographic operations with `npm run bench`
- Document performance characteristics
- Consider memory usage for batch operations
- Test with large datasets (Merkle trees, batch verification)

## Submitting Changes

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Run linter: `npm run lint`
3. Update documentation
4. Update CHANGELOG.md
5. Test your changes manually

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "feat: description"`
4. Push to your fork: `git push origin feature/your-feature`
5. Create a Pull Request with:
   - Clear description of changes
   - Reference to related issues
   - Screenshot/output if applicable
   - Security implications if any

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:
```
fix(core): prevent JSON parsing stack overflow

Add recursion limit to JSON parser to prevent DoS
attacks with deeply nested credentials.

Fixes #123
```

## Reporting Security Issues

**Do not open public issues for security vulnerabilities!**

Please email security@iecc.world with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Development Tips

### Debugging

```bash
# Enable debug output
DEBUG=iecc:* npm test

# Run specific test file
npm test -- src/core.test.ts

# Run tests matching pattern
npm test -- --grep "Merkle"
```

### Building for Different Environments

```bash
# Node.js CommonJS
npm run build

# ES Modules
npm run build -- --format esm

# Browser/WASM
npm run build -- --format esm  # Then bundle with esbuild
```

## Questions?

- Check existing issues and discussions
- Read the documentation
- Ask in GitHub Discussions
- Contact: hello@iecc.world

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to IECC Verifier!
