# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

**IECC (International Electronic Credential Consortium)** 公式 TypeScript 検証ライブラリ。

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

**AI 時代**向けに設計された独立した資格情報検証プロトコル。Ed25519 署名、RFC 8785 標準化、およびオフラインファーストの検証をサポートしています。

## ✨ 主な特徴

- **🔒 決定的信頼**: **Ed25519** と **JSON Canonicalization (RFC 8785)** に基づき、すべてのプラットフォームで一貫した検証を実現。
- **🤖 AI ネイティブ**: **Model Context Protocol (MCP)** を標準サポート。
- **⚡ 高スループット**: 一括監査のための **Merkle Tree** 構造をサポート。
- **🌐 オフラインファースト**: 暗号化証明を通じて信頼を確立し、中央データベースは不要。

## 🚀 クイックスタート

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ 検証済み!" : "❌ 失敗");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
