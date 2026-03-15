#!/usr/bin/env node
import { verifyCredential } from './index.js';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

// Security constants
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

if (args.length < 3) {
  console.log('Usage: iecc-verify <credential.json> <signature_hex> <public_key_hex>');
  process.exit(1);
}

/**
 * Validate file path to prevent directory traversal attacks
 */
function validateFilePath(filePath: string, baseDir: string = process.cwd()): boolean {
  const resolved = path.resolve(filePath);
  const base = path.resolve(baseDir);
  return resolved.startsWith(base);
}

/**
 * Read file with size limit
 */
function readFileWithLimit(filePath: string, maxSize: number): string {
  const stats = fs.statSync(filePath);
  
  if (stats.size > maxSize) {
    throw new Error(`File too large: ${stats.size} bytes exceeds maximum ${maxSize} bytes`);
  }

  return fs.readFileSync(filePath, 'utf-8');
}

async function run() {
  try {
    const filePath = path.resolve(args[0]);
    const signature = args[1];
    const publicKey = args[2];

    // Validate path
    if (!validateFilePath(filePath)) {
      console.error('Error: Invalid file path (directory traversal detected)');
      process.exit(1);
    }

    // Check file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    // Read file with size check
    let payload: string;
    try {
      payload = readFileWithLimit(filePath, MAX_FILE_SIZE_BYTES);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error reading file';
      console.error(`Error: ${msg}`);
      process.exit(1);
    }

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
      process.exit(1);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred during verification';
    console.error(`Error: ${msg}`);
    process.exit(1);
  }
}

run();
