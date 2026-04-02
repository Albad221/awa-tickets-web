function decodeBase64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeText(input: string): ArrayBuffer {
  return new TextEncoder().encode(input).buffer as ArrayBuffer;
}

export interface BuyerClaim {
  phone: string;
  exp: number;
}

export async function verifyBuyerClaimToken(
  token: string,
  secret: string,
): Promise<BuyerClaim | null> {
  const [payloadB64, signatureB64] = token.split(".");
  if (!payloadB64 || !signatureB64 || !secret) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encodeText(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expectedSignature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encodeText(payloadB64)),
  );
  const actualSignature = decodeBase64Url(signatureB64);

  if (expectedSignature.length !== actualSignature.length) {
    return null;
  }
  for (let index = 0; index < expectedSignature.length; index += 1) {
    if (expectedSignature[index] !== actualSignature[index]) {
      return null;
    }
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(payloadB64)),
    ) as BuyerClaim;
    if (!payload.phone || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
