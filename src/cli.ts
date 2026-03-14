#!/usr/bin/env node
import { verifyCredential } from './index.js';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: iecc-verify <credential.json> <signature_hex> <public_key_hex>');
  process.exit(1);
}

async function run() {
  try {
    const filePath = path.resolve(args[0]);
    const signature = args[1];
    const publicKey = args[2];

    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    const payload = fs.readFileSync(filePath, 'utf-8');
    const result = await verifyCredential(payload, signature, publicKey);

    if (result.isValid) {
      console.log('\x1b[32m%s\x1b[0m', '✓ Credential Verified');
      console.log('--------------------------');
      console.log(`Issuer:    ${result.issuer}`);
      console.log(`Issued At: ${new Date(result.timestamp!).toLocaleString()}`);
      console.log(`Subject:   ${result.data?.subject}`);
    } else {
      console.log('\x1b[31m%s\x1b[0m', '✗ Verification Failed');
      console.log(`Reason: ${result.error}`);
    }
  } catch (err) {
    console.error('An unexpected error occurred during verification.');
    process.exit(1);
  }
}

run();
