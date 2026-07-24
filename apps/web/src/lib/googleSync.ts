const DRIVE_SCOPE =
  'openid email https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'academic-scriptures.e2ee.json';
const ITERATIONS = 310_000;

export interface GoogleSession {
  accessToken: string;
  email?: string;
}

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface EncryptedEnvelope {
  version: 1;
  algorithm: 'AES-GCM-256';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
  updatedAt: string;
}

const encode = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decode = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const buffer = (bytes: Uint8Array) =>
  Uint8Array.from(bytes).buffer as ArrayBuffer;

const deriveKey = async (
  passphrase: string,
  salt: Uint8Array,
  iterations: number,
) => {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: buffer(salt),
      iterations,
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export async function encryptSyncData(
  value: unknown,
  passphrase: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: buffer(iv) },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  );
  const envelope: EncryptedEnvelope = {
    version: 1,
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA-256',
    iterations: ITERATIONS,
    salt: encode(salt),
    iv: encode(iv),
    ciphertext: encode(new Uint8Array(ciphertext)),
    updatedAt: new Date().toISOString(),
  };
  return JSON.stringify(envelope);
}

export async function decryptSyncData<T>(
  encrypted: string,
  passphrase: string,
): Promise<T> {
  const envelope = JSON.parse(encrypted) as EncryptedEnvelope;
  if (
    envelope.version !== 1 ||
    envelope.algorithm !== 'AES-GCM-256' ||
    envelope.kdf !== 'PBKDF2-SHA-256'
  ) {
    throw new Error('Unsupported encrypted sync format');
  }
  const key = await deriveKey(
    passphrase,
    decode(envelope.salt),
    envelope.iterations,
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: buffer(decode(envelope.iv)) },
    key,
    buffer(decode(envelope.ciphertext)),
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}

const waitForGoogle = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (window.google?.accounts?.oauth2) return window.google;
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  throw new Error('Google Identity Services did not load');
};

export async function signInWithGoogle(
  clientId: string,
): Promise<GoogleSession> {
  const google = await waitForGoogle();
  const response = await new Promise<TokenResponse>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: resolve,
      error_callback: reject,
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
  if (!response.access_token || response.error) {
    throw new Error(
      response.error_description ?? response.error ?? 'Google sign-in failed',
    );
  }

  const profileResponse = await fetch(
    'https://openidconnect.googleapis.com/v1/userinfo',
    {
      headers: { Authorization: `Bearer ${response.access_token}` },
    },
  );
  const profile = profileResponse.ok
    ? ((await profileResponse.json()) as { email?: string })
    : {};
  return { accessToken: response.access_token, email: profile.email };
}

const authorizedFetch = (
  session: GoogleSession,
  input: RequestInfo | URL,
  init: RequestInit = {},
) =>
  fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...init.headers,
    },
  });

async function findSyncFile(session: GoogleSession) {
  const query = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name='${FILE_NAME}' and trashed=false`,
    fields: 'files(id,name,modifiedTime)',
    pageSize: '1',
  });
  const response = await authorizedFetch(
    session,
    `https://www.googleapis.com/drive/v3/files?${query}`,
  );
  if (!response.ok) throw new Error(`Drive list failed: ${response.status}`);
  const result = (await response.json()) as {
    files?: { id: string; modifiedTime?: string }[];
  };
  return result.files?.[0];
}

export async function downloadEncryptedSync(session: GoogleSession) {
  const file = await findSyncFile(session);
  if (!file) return undefined;
  const response = await authorizedFetch(
    session,
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
  );
  if (!response.ok) throw new Error(`Drive download failed: ${response.status}`);
  return { fileId: file.id, encrypted: await response.text() };
}

export async function uploadEncryptedSync(
  session: GoogleSession,
  encrypted: string,
  knownFileId?: string,
) {
  const fileId = knownFileId ?? (await findSyncFile(session))?.id;
  if (fileId) {
    const response = await authorizedFetch(
      session,
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: encrypted,
      },
    );
    if (!response.ok) throw new Error(`Drive update failed: ${response.status}`);
    return fileId;
  }

  const boundary = `academic-scriptures-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({
    name: FILE_NAME,
    parents: ['appDataFolder'],
    mimeType: 'application/json',
  });
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadata,
    `--${boundary}`,
    'Content-Type: application/json',
    '',
    encrypted,
    `--${boundary}--`,
  ].join('\r\n');
  const response = await authorizedFetch(
    session,
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  if (!response.ok) throw new Error(`Drive create failed: ${response.status}`);
  return ((await response.json()) as { id: string }).id;
}

export async function revokeGoogleSession(session: GoogleSession) {
  const google = await waitForGoogle();
  await new Promise<void>((resolve) => {
    google.accounts.oauth2.revoke(session.accessToken, () => resolve());
  });
}
