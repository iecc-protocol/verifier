export interface TrustedIssuer {
  id: string;
  name: string;
  website: string;
  publicKey: string;
  status: 'active' | 'revoked' | 'suspended';
}

// Default embedded issuers (can be overridden)
const DEFAULT_TRUSTED_ISSUERS: TrustedIssuer[] = [
  {
    id: 'IECC-ORG-001',
    name: 'Global Tech Academy',
    website: 'https://academy.example.com',
    publicKey: 'e2b123f4567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
    status: 'active',
  },
  {
    id: 'IECC-ORG-002',
    name: 'Cyber Defense Institute',
    website: 'https://cdi.example.org',
    publicKey: 'a3f823f4567890abcdef1234567890abcdef1234567890abcdef1234567890bc',
    status: 'active',
  },
  {
    id: 'IECC-ORG-999',
    name: 'Legacy Training Center',
    website: 'https://legacy.example.net',
    publicKey: 'deadbeef567890abcdef1234567890abcdef1234567890abcdef1234567890df',
    status: 'revoked',
  },
];

// Global registry (can be updated at runtime)
let globalRegistry: TrustedIssuer[] = DEFAULT_TRUSTED_ISSUERS;

/**
 * Load trusted issuers from URL (with caching)
 */
export async function loadTrustedIssuers(url: string, options?: { timeout?: number; cache?: number }): Promise<TrustedIssuer[]> {
  const timeout = options?.timeout ?? 5000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid Content-Type: expected application/json');
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Expected JSON array of issuers');
    }

    // Validate each issuer
    const issuers = data.map((issuer: unknown) => validateIssuer(issuer));
    globalRegistry = issuers;
    return issuers;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate issuer object structure and types
 */
function validateIssuer(issuer: unknown): TrustedIssuer {
  if (typeof issuer !== 'object' || issuer === null) {
    throw new Error('Issuer must be an object');
  }

  const obj = issuer as Record<string, unknown>;
  
  if (typeof obj.id !== 'string' || !obj.id.trim()) {
    throw new Error('Issuer must have non-empty id');
  }
  if (typeof obj.name !== 'string' || !obj.name.trim()) {
    throw new Error('Issuer must have non-empty name');
  }
  if (typeof obj.publicKey !== 'string' || !/^[0-9a-f]{64}$/i.test(obj.publicKey)) {
    throw new Error(`Issuer ${obj.id} has invalid publicKey (must be 64 hex chars)`);
  }
  if (!['active', 'revoked', 'suspended'].includes(obj.status as string)) {
    throw new Error(`Issuer ${obj.id} has invalid status`);
  }

  return {
    id: obj.id,
    name: obj.name,
    website: typeof obj.website === 'string' ? obj.website : 'unknown',
    publicKey: obj.publicKey,
    status: obj.status as 'active' | 'revoked' | 'suspended',
  };
}

/**
 * Get current trusted issuers registry
 */
export function getTrustedIssuers(): TrustedIssuer[] {
  return [...globalRegistry];
}

/**
 * Add or update an issuer (for testing/development)
 */
export function setTrustedIssuer(issuer: TrustedIssuer): void {
  const index = globalRegistry.findIndex(i => i.id === issuer.id);
  if (index >= 0) {
    globalRegistry[index] = issuer;
  } else {
    globalRegistry.push(issuer);
  }
}

/**
 * Reset to default issuers
 */
export function resetTrustedIssuers(): void {
  globalRegistry = [...DEFAULT_TRUSTED_ISSUERS];
}
