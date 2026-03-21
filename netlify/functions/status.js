const https = require("https");

const OWNER = "dazulu";
const REPO = "hsp-signup";

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod !== "GET") {
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

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server misconfigured" }),
    };
  }

  try {
    const after = event.queryStringParameters?.after || null;
    const run = await getLatestRun(token, after);
    if (!run) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: "not_found" }),
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: run.status,
        conclusion: run.conclusion,
        created_at: run.created_at,
      }),
    };
  } catch (err) {
    console.error("Status check failed:", err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not check status" }),
    };
  }
};

function getLatestRun(token, after) {
  return new Promise((resolve, reject) => {
    const path = `/repos/${OWNER}/${REPO}/actions/runs?event=repository_dispatch&per_page=5`;
    const req = https.request(
      {
        hostname: "api.github.com",
        path,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "hsp-signup-netlify",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`GitHub ${res.statusCode}: ${body}`));
          }
          const data = JSON.parse(body);
          const runs = data.workflow_runs || [];
          if (after) {
            const afterTime = new Date(after).getTime();
            const match = runs.find(
              (r) => new Date(r.created_at).getTime() >= afterTime
            );
            resolve(match || null);
          } else {
            resolve(runs[0] || null);
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}
