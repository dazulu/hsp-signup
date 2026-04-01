import { createCipheriv, randomBytes } from "node:crypto";
import https from "node:https";
import type { Handler } from "@netlify/functions";

const OWNER = "dazulu";
const REPO = "hsp-signup";

function encryptField(text: string, keyHex: string): string {
  const key = Buffer.from(keyHex, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method not allowed" };
  }

  // Verify API key
  const apiKey = process.env.API_KEY;
  const provided = event.headers["x-api-key"];
  if (!apiKey || !provided || provided !== apiKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  let email: string;
  let password: string;
  let sport: string;
  let correlationId: string;
  try {
    ({ email, password, sport, correlationId } = JSON.parse(event.body!));
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  if (
    !email ||
    !password ||
    !["hurling", "football"].includes(sport) ||
    typeof correlationId !== "string" ||
    !correlationId
  ) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid request" }),
    };
  }

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server misconfigured" }),
    };
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server misconfigured" }),
    };
  }

  const encEmail = encryptField(email, encryptionKey);
  const encPassword = encryptField(password, encryptionKey);

  try {
    await dispatch(token, sport, encEmail, encPassword, correlationId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, sport, correlationId }),
    };
  } catch (err) {
    console.error("Trigger failed:", (err as Error).message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not trigger workflow" }),
    };
  }
};

function dispatch(
  token: string,
  sport: string,
  hspEmail: string,
  hspPassword: string,
  correlationId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      event_type: "book-sport",
      client_payload: {
        sport,
        hsp_email: hspEmail,
        hsp_password: hspPassword,
        correlation_id: correlationId,
      },
    });

    const req = https.request(
      {
        hostname: "api.github.com",
        path: `/repos/${OWNER}/${REPO}/dispatches`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "hsp-signup-netlify",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        if (res.statusCode === 204) {
          return resolve();
        }
        let body = "";
        res.on("data", (c: string) => (body += c));
        res.on("end", () =>
          reject(new Error(`GitHub ${res.statusCode}: ${body}`)),
        );
      },
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
