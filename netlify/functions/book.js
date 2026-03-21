const https = require("node:https");

const OWNER = "dazulu";
const REPO = "hsp-signup";

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

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

  let email, password, sport;
  try {
    ({ email, password, sport } = JSON.parse(event.body));
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  if (!email || !password || !["hurling", "football"].includes(sport)) {
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

  try {
    await dispatch(token, sport, email, password);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, sport }),
    };
  } catch (err) {
    console.error("Trigger failed:", err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not trigger workflow" }),
    };
  }
};

function dispatch(token, sport, hspEmail, hspPassword) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      event_type: "book-sport",
      client_payload: {
        sport,
        hsp_email: hspEmail,
        hsp_password: hspPassword,
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
        res.on("data", (c) => (body += c));
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
