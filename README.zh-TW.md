# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

**IECC (International Electronic Credential Consortium)** 官方 TypeScript 驗證庫。

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

這是一個為 **AI 時代**設計的獨立憑證驗證協議，支持 Ed25519 簽名、RFC 8785 規範化以及離線優先驗證。

## ✨ 核心特性

- **🔒 確定性信任**: 基於 **Ed25519** 和 **JSON Canonicalization (RFC 8785)**，確保跨平台驗證結果完全一致。
- **🤖 AI 原生**: 內置支持 **Model Context Protocol (MCP)**。AI Agent（如 Claude/ChatGPT）可直接將此驗證器作為工具調用。
- **⚡ 高吞吐量**: 支持 **Merkle Tree** 結構，適用於大規模憑證的快速審計。
- **🌐 離線優先**: 通過密碼學證明建立信任，無需訪問中央數據庫，保護隱私並符合 GDPR。

## 🚀 快速開始

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ 驗證通過!" : "❌ 驗證失敗");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
