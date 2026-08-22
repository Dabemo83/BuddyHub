export const AUTH_COOKIE = "buddyhub_auth";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Token to store in the cookie for a given password. */
export async function tokenFor(password: string): Promise<string> {
  return sha256(`buddyhub:${password}`);
}

/** Whether a cookie token is valid for the configured password. */
export async function isValidToken(token: string, password: string): Promise<boolean> {
  if (!token || !password) return false;
  return token === (await tokenFor(password));
}
