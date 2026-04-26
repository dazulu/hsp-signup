import https from "node:https";
import type { Handler } from "@netlify/functions";

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

  const apiKey = process.env.API_KEY;
  const provided = event.headers["x-api-key"];
  if (!apiKey || !provided || provided !== apiKey) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "Unauthorized" }),
    };
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  const clubId = process.env.STRAVA_CLUB_ID;

  if (!clientId || !clientSecret || !refreshToken || !clubId) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server misconfigured" }),
    };
  }

  try {
    const tokenPayload = JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const tokenData = await httpsRequest<{ access_token: string }>(
      "www.strava.com",
      "/oauth/token",
      "POST",
      {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(tokenPayload),
      },
      tokenPayload,
    );

    const activities = await httpsRequest<
      Array<{
        type: string;
        sport_type: string;
        distance: number;
        moving_time: number;
        athlete: { firstname: string; lastname: string };
      }>
    >(
      "www.strava.com",
      `/api/v3/clubs/${clubId}/activities?page=1&per_page=200`,
      "GET",
      { Authorization: `Bearer ${tokenData.access_token}` },
    );

    const runs = activities.filter(
      (activity) => activity.sport_type === "Run" || activity.type === "Run",
    );

    const totalDistanceKm =
      runs.reduce((acc, activity) => acc + activity.distance, 0) / 1000;

    let totalAveragePace = "0:00";
    if (runs.length > 0) {
      const totalPaceSeconds = runs.reduce(
        (acc, activity) =>
          acc + activity.moving_time / (activity.distance / 1000),
        0,
      );
      const avgPaceSeconds = Math.floor(totalPaceSeconds / runs.length);
      const minutes = Math.floor(avgPaceSeconds / 60);
      const seconds = avgPaceSeconds % 60;
      totalAveragePace = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    const latestRun =
      runs.length > 0
        ? {
            athleteName: `${runs[0].athlete.firstname} ${runs[0].athlete.lastname}`,
            distanceKm: runs[0].distance / 1000,
          }
        : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ totalDistanceKm, totalAveragePace, latestRun }),
    };
  } catch (error) {
    console.error("Strava fetch failed:", (error as Error).message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Failed to fetch Strava data" }),
    };
  }
};

function httpsRequest<T>(
  hostname: string,
  path: string,
  method: string,
  reqHeaders: Record<string, string | number>,
  body?: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const request = https.request(
      { hostname, path, method, headers: reqHeaders },
      (httpResponse) => {
        let data = "";
        httpResponse.on("data", (chunk: string) => (data += chunk));
        httpResponse.on("end", () => {
          try {
            const parsed = JSON.parse(data) as T;
            if ((httpResponse.statusCode ?? 0) >= 400) {
              reject(new Error(`Strava ${httpResponse.statusCode}: ${data}`));
            } else {
              resolve(parsed);
            }
          } catch {
            reject(new Error(`JSON parse error: ${data}`));
          }
        });
      },
    );
    request.on("error", reject);
    if (body) {
      request.write(body);
    }
    request.end();
  });
}
