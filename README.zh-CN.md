# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

**IECC (International Electronic Credential Consortium)** 官方 TypeScript 验证库。

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

这是一个为 **AI 时代**设计的独立凭证验证协议，支持 Ed25519 签名、RFC 8785 规范化以及离线优先验证。

## ✨ 核心特性

- **🔒 确定性信任**: 基于 **Ed25519** 和 **JSON Canonicalization (RFC 8785)**，确保跨平台验证结果完全一致。
- **🤖 AI 原生**: 内置支持 **Model Context Protocol (MCP)**。AI Agent（如 Claude/ChatGPT）可直接将此验证器作为工具调用。
- **⚡ 高吞吐量**: 支持 **Merkle Tree** 结构，适用于大规模凭证的快速审计。
- **🌐 离线优先**: 通过密码学证明建立信任，无需访问中央数据库，保护隐私并符合 GDPR。

## 🚀 快速开始

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ 验证通过!" : "❌ 验证失败");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
