# IECC Verifier (Open Source Trust Protocol) 🛡️

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/@iecc/verifier.svg)](https://www.npmjs.com/package/@iecc/verifier)

Bibliothèque de vérification TypeScript officielle de l'**IECC (International Electronic Credential Consortium)**.

---

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [Français](README.fr.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [日本語](README.ja.md) | [العربية](README.ar.md)

---

Un protocole de vérification de justificatifs indépendant conçu pour l'**ère de l'IA**, prenant en charge les signatures Ed25519, la canonisation RFC 8785 et la vérification hors ligne en priorité.

## ✨ Fonctionnalités clés

- **🔒 Confiance déterministe** : Basé sur **Ed25519** et **JSON Canonicalization (RFC 8785)** pour une vérification cohérente sur toutes les plateformes.
- **🤖 IA-native** : Prise en charge intégrée du **Model Context Protocol (MCP)**.
- **⚡ Haute performance** : Prend en charge les structures **Merkle Tree** pour l'audit en masse.
- **🌐 Hors ligne en priorité** : La confiance est établie via des preuves cryptographiques, aucune base de données centrale n'est requise.

## 🚀 Démarrage rapide

```bash
npm install @iecc/verifier
```

```typescript
import { verifyCredential } from '@iecc/verifier';

const result = await verifyCredential(payload, signature, publicKey);
console.log(result.isValid ? "✅ Vérifié !" : "❌ Échec");
```

---
© 2026 IECC Network. [www.iecc.world](https://www.iecc.world)
