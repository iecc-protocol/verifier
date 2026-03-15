# Getting Started with IECC Verifier

**Version**: 1.1.0  
**Last Updated**: 2026年3月15日

---

## 📖 目录

1. [安装](#installation)
2. [基础使用](#basic-usage)
3. [验证凭证](#verifying-credentials)
4. [高级功能](#advanced-features)
5. [常见问题](#faq)
6. [故障排除](#troubleshooting)

---

## Installation

### 系统要求

- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **TypeScript**: 5.0.0 或更高版本（如果使用 TypeScript）

### 安装步骤

```bash
# 1. 通过 NPM 安装
npm install @iecc/verifier@1.1.0

# 2. 验证安装
npm list @iecc/verifier
# @iecc/verifier@1.1.0

# 3. 检查 CLI 工具
npx iecc-verify --help
```

### 配置

创建 `.env` 文件（可选）：

```env
# 设置根公钥
IECC_ROOT_PUBLIC_KEY=your-root-pubkey-here

# CLI 默认超时（毫秒）
IECC_CLI_TIMEOUT=5000
```

---

## Basic Usage

### JavaScript 方式

```javascript
const { verifyCredential } = require('@iecc/verifier');

async function verify() {
  const credential = {
    id: "CERT-001",
    issuer: "IECC-ORG-001",
    subject: "John Doe",
    claims: { skill: "TypeScript" },
    issuedAt: Date.now(),
  };

  const result = await verifyCredential(
    JSON.stringify(credential),
    "a1b2c3...", // 签名 (128 hex 字符)
    "d4e5f6..."  // 公钥 (64 hex 字符)
  );

  console.log(result);
  // {
  //   isValid: true,
  //   issuer: "IECC-ORG-001",
  //   timestamp: 1234567890,
  //   data: { ... }
  // }
}

verify().catch(console.error);
```

### TypeScript 方式

```typescript
import { verifyCredential, type VerificationResult } from '@iecc/verifier';

interface Certificate {
  id: string;
  issuer: string;
  subject: string;
  claims: Record<string, unknown>;
  issuedAt: number;
}

async function verifyCertificate(
  cert: Certificate,
  signature: string,
  publicKey: string
): Promise<VerificationResult> {
  return await verifyCredential(
    JSON.stringify(cert),
    signature,
    publicKey
  );
}

// 使用
const cert: Certificate = {
  id: "CERT-001",
  issuer: "IECC-ORG-001",
  subject: "Jane Smith",
  claims: { role: "Engineer", level: "Senior" },
  issuedAt: Date.now(),
};

const result = await verifyCertificate(cert, sig, key);
if (result.isValid) {
  console.log(`✅ 验证成功: ${result.issuer}`);
} else {
  console.log(`❌ 验证失败: ${result.error}`);
}
```

---

## Verifying Credentials

### 凭证格式

凭证必须符合以下格式：

```typescript
interface CredentialData {
  id: string;                    // 唯一标识符
  issuer: string;                // 颁发者ID
  subject: string;               // 主体（持证人）
  claims: Record<string, unknown>; // 声明数据
  issuedAt: number;              // 颁发时间戳
}
```

### 签名格式

- **签名格式**: 128 个十六进制字符（64 字节 Ed25519 签名）。**请注意：** 不要包含 `0x` 前缀。
- **公钥格式**: 64 个十六进制字符（32 字节 Ed25519 公钥）。**请注意：** 不要包含 `0x` 前缀。

### 示例：完整验证流程

```typescript
import { verifyCredential, getTrustedIssuers } from '@iecc/verifier';

async function fullVerificationFlow() {
  // 1. 准备凭证
  const credential = {
    id: "CERT-2024-001",
    issuer: "IECC-ORG-001",
    subject: "Alice Johnson",
    claims: {
      course: "Advanced TypeScript",
      score: 95,
      completion_date: "2024-03-15"
    },
    issuedAt: Date.now(),
  };

  const payload = JSON.stringify(credential);
  const signature = "a1b2c3d4e5f6..."; // 128 hex chars
  const publicKey = "d4e5f6g7h8...";   // 64 hex chars

  // 2. 验证签名
  const result = await verifyCredential(payload, signature, publicKey);

  // 3. 检查结果
  if (!result.isValid) {
    console.error(`❌ 验证失败: ${result.error}`);
    return null;
  }

  // 4. 检查颁发者是否被信任
  const trustedIssuers = getTrustedIssuers();
  const issuerInfo = trustedIssuers.find(i => i.id === result.issuer);
  
  if (!issuerInfo) {
    console.error("❌ 颁发者未被信任");
    return null;
  }

  if (issuerInfo.status === 'revoked') {
    console.error("❌ 颁发者已被撤销");
    return null;
  }

  // 5. 成功！
  console.log(`✅ 凭证已验证`);
  console.log(`   颁发者: ${result.issuer}`);
  console.log(`   主体: ${result.data?.subject}`);
  console.log(`   时间: ${new Date(result.timestamp!)}`);

  return result.data;
}
```

---

## Advanced Features

### 1. 批量验证

```typescript
import { auditBatch, verifyCredential } from '@iecc/verifier';

async function batchVerify() {
  const credentials = [
    { id: "1", issuer: "IECC-ORG-001", ... },
    { id: "2", issuer: "IECC-ORG-001", ... },
    { id: "3", issuer: "IECC-ORG-002", ... },
  ];

  const results = await auditBatch(
    verifyCredential,
    credentials.map(c => JSON.stringify(c)),
    ["sig1", "sig2", "sig3"],
    ["key1", "key1", "key2"],
    { concurrency: 5 }  // 最多同时5个
  );

  const validCount = results.filter(r => r.isValid).length;
  console.log(`验证完成: ${validCount}/${results.length} 成功`);

  return results;
}
```

### 2. 动态加载颁发者

```typescript
import { 
  loadTrustedIssuers, 
  getTrustedIssuers,
  setTrustedIssuer 
} from '@iecc/verifier';

// 从远程 URL 加载
async function loadIssuers() {
  try {
    const issuers = await loadTrustedIssuers(
      'https://registry.iecc.world/issuers.json',
      { timeout: 5000 }
    );
    console.log(`✅ 加载了 ${issuers.length} 个颁发者`);
  } catch (err) {
    console.error(`❌ 加载失败: ${err}`);
  }
}

// 添加自定义颁发者（测试用）
function addCustomIssuer() {
  setTrustedIssuer({
    id: 'TEST-ORG-001',
    name: 'Test Organization',
    website: 'https://test.example.com',
    publicKey: 'a'.repeat(64),
    status: 'active'
  });
}

// 列出所有颁发者
function listIssuers() {
  const issuers = getTrustedIssuers();
  issuers.forEach(issuer => {
    console.log(`${issuer.id}: ${issuer.status}`);
  });
}
```

### 3. Merkle 树验证

```typescript
import { verifyMerkleProof, generateMerkleRoot } from '@iecc/verifier';

// 生成 Merkle 根
function createMerkleRoot() {
  const hashes = [
    'a'.repeat(64),
    'b'.repeat(64),
    'c'.repeat(64),
  ];

  const root = generateMerkleRoot(hashes);
  console.log(`根哈希: ${root}`);
  return root;
}

// 验证 Merkle 证明
function verifyProof() {
  const leaf = 'a'.repeat(64);
  const root = 'xyz...'; // Merkle 根
  const proof = ['p1', 'p2', 'p3']; // 证明路径

  const result = verifyMerkleProof(leaf, root, proof);
  
  if (result.isValid) {
    console.log("✅ Merkle 证明有效");
  } else {
    console.log(`❌ 验证失败: ${result.error}`);
  }
}
```

---

## CLI Tool

### 基本用法

```bash
# 验证单个凭证文件
iecc-verify credential.json signature_hex public_key_hex

# 例子
iecc-verify cert.json a1b2c3d4... d4e5f6g7...
```

### 输出

```
✓ Credential Verified
--------------------------
Issuer:    IECC-ORG-001
Issued At: 2026/3/15 10:30:45
Subject:   John Doe
```

### 错误处理

```bash
# 文件不存在
$ iecc-verify missing.json sig key
Error: File not found at /path/to/missing.json

# 无效的签名格式
$ iecc-verify cert.json invalid_sig key
Error: Invalid signature format: must be 128 hex characters (64 bytes)

# 验证失败
$ iecc-verify cert.json sig key
✗ Verification Failed
Reason: Cryptographic signature mismatch
```

---

## FAQ

### Q: 签名格式是什么？
**A**: Ed25519 签名（64 字节）表示为 128 个十六进制字符。不建议使用 `0x` 前缀，以保持与 Ed25519 标准编码的一致性。

### Q: 如何生成 Ed25519 密钥对？
**A**: 使用 `@noble/ed25519`:
```typescript
import * as ed from '@noble/ed25519';

const privateKey = ed.utils.randomPrivateKey();
const publicKey = await ed.getPublicKey(privateKey);
```

### Q: 支持哪些 Node.js 版本？
**A**: 18.0.0 或更高。推荐使用最新的 LTS 版本。

### Q: 凭证大小有限制吗？
**A**: 是的，最大 10MB。这是为了防止内存溢出攻击。

### Q: 支持浏览器使用吗？
**A**: 支持。可以通过 bundler（webpack、vite）使用。推荐使用 ESM 版本。

### Q: 如何处理离线验证？
**A**: 预先加载颁发者列表，然后离线验证。不需要网络连接。

### Q: GDPR 兼容吗？
**A**: 是的。不存储中央数据库，完全点对点验证。

---

## Troubleshooting

### 问题 1: "Issuer not found"

```
❌ Verification Failed
Reason: Unknown or untrusted issuer ID
```

**解决方案**:
```typescript
// 加载最新的颁发者列表
await loadTrustedIssuers('https://registry.example.com/issuers.json');

// 或手动添加
setTrustedIssuer({
  id: 'IECC-ORG-001',
  name: 'Example Org',
  website: 'https://example.com',
  publicKey: 'abc123...',
  status: 'active'
});
```

### 问题 2: "Cryptographic signature mismatch"

**原因**: 签名无效或公钥不匹配

**解决方案**:
1. 检查签名格式（128 个十六进制字符）
2. 检查公钥格式（64 个十六进制字符）
3. 确保使用了正确的公钥
4. 验证凭证 JSON 是否被修改

### 问题 3: "Invalid JSON nesting depth"

**原因**: JSON 嵌套深度超过限制（最多 10 层）

**解决方案**:
```typescript
// 简化你的凭证结构
// ❌ 太深
{
  level1: { level2: { level3: { ... } } }
}

// ✅ 扁平结构
{
  data: { key: value }
}
```

### 问题 4: "File too large"

**原因**: 凭证文件超过 10MB

**解决方案**: 分割大文件，批量处理

---

## 下一步

- 📖 查看 [API 参考](./README.md#-api-reference)
- 🧪 运行测试: `npm test`
- 🛠️ 贡献代码: 查看 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 🔐 安全政策: 查看 [SECURITY.md](./SECURITY.md)

---

**需要帮助?** 提交问题到 [GitHub Issues](https://github.com/iecc-protocol/verifier/issues)
