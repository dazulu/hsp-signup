import https from "node:https";
import type { Handler } from "@netlify/functions";

const OWNER = "dazulu";
const REPO = "hsp-signup";

interface WorkflowRun {
  name: string | null;
  status: string;
  conclusion: string | null;
}

export const handler: Handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

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

  const correlationId = event.queryStringParameters?.correlationId;
  if (!correlationId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing or invalid correlationId" }),
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
    const runs = await listRuns(token);
    const match = runs.find((run) => run.name?.includes(correlationId));

    if (!match) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: "pending" }),
      };
    }

    if (match.status !== "completed") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: "in_progress" }),
      };
    }

    const status =
      match.conclusion === "success"
        ? "success"
        : match.name?.includes("[AUTH_FAILED]")
          ? "auth_failed"
          : "failure";
    return { statusCode: 200, headers, body: JSON.stringify({ status }) };
  } catch (error) {
    console.error("Status check failed:", (error as Error).message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not fetch workflow status" }),
    };
  }
};

function listRuns(token: string): Promise<WorkflowRun[]> {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "api.github.com",
        path: `/repos/${OWNER}/${REPO}/actions/runs?event=repository_dispatch&per_page=20`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "hsp-signup-netlify",
        },
      },
      (httpResponse) => {
        let body = "";
        httpResponse.on("data", (chunk: string) => (body += chunk));
        httpResponse.on("end", () => {
          if (httpResponse.statusCode !== 200) {
            return reject(
              new Error(`GitHub ${httpResponse.statusCode}: ${body}`),
            );
          }
          try {
            resolve(JSON.parse(body).workflow_runs);
          } catch {
            reject(new Error("Invalid JSON from GitHub"));
          }
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
}
