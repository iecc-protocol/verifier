# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

Biblioteca de verificación TypeScript oficial de **IECC (International Electronic Credential Consortium)**.

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

Un protocolo de verificación de credenciales independiente diseñado para la **era de la IA**, compatible con firmas Ed25519, canonización RFC 8785 y verificación centrada en la desconexión.

## ✨ Características clave

- **🔒 Confianza determinante** : Basado en **Ed25519** y **JSON Canonicalization (RFC 8785)** para una verificación constante en todas las plataformas.
- **🤖 IA nativa** : Compatibilidad integrada con el **Model Context Protocol (MCP)**.
- **⚡ Alto rendimiento** : Compatible con estructuras **Merkle Tree** para auditorías masivas.
- **🌐 Desconexión primero** : La confianza se establece mediante pruebas criptográficas, no se requiere una base de datos central.

## 🚀 Inicio rápido

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ ¡Verificado!" : "❌ Falló");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
