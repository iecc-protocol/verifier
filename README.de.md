# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

Offizielle TypeScript-Verifizierungsbibliothek des **IECC (International Electronic Credential Consortium)**.

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

Ein unabhängiges Protokoll zur Verifizierung von Nachweisen, das für das **KI-Zeitalter** entwickelt wurde und Ed25519-Signaturen, RFC 8785-Kanonisierung sowie Offline-First-Verifizierung unterstützt.

## ✨ Hauptmerkmale

- **🔒 Deterministisches Vertrauen**: Basiert auf **Ed25519** und **JSON Canonicalization (RFC 8785)** für eine konsistente Verifizierung über alle Plattformen hinweg.
- **🤖 KI-nativ**: Integrierte Unterstützung für das **Model Context Protocol (MCP)**.
- **⚡ Hoher Durchsatz**: Unterstützt **Merkle Tree**-Strukturen für Massenprüfungen.
- **🌐 Offline-First**: Vertrauen wird durch kryptografische Beweise hergestellt, keine zentrale Datenbank erforderlich.

## 🚀 Schnellstart

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ Verifiziert!" : "❌ Fehlgeschlagen");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
