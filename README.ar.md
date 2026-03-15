# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

مكتبة التحقق الرسمية بلغة TypeScript من **IECC (International Electronic Credential Consortium)**.

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

بروتوكول تحقق مستقل من أوراق الاعتماد مصمم لـ **عصر الذكاء الاصطناعي**، يدعم تواقيع Ed25519، ومعيار RFC 8785، والتحقق المعتمد على عدم الاتصال أولاً.

## ✨ المميزات الرئيسية

- **🔒 ثقة حتمية**: مبني على **Ed25519** و **JSON Canonicalization (RFC 8785)** لضمان تناسق التحقق عبر جميع المنصات.
- **🤖 ذكاء اصطناعي أصلي**: دعم مدمج لـ **Model Context Protocol (MCP)**.
- **⚡ إنتاجية عالية**: يدعم هياكل **Merkle Tree** للتدقيق الجماعي.
- **🌐 عدم الاتصال أولاً**: يتم تأسيس الثقة عبر البراهين المشفرة، دون الحاجة لقاعدة بيانات مركزية.

## 🚀 البدء السريع

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ تم التحقق!" : "❌ فشل");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
