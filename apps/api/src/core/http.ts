import { URL } from "node:url";
import { ZodError } from "zod";

export interface RequestContext {
  method: string;
  path: string;
  url: URL;
}

export function json(res: import("node:http").ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

export function parseJsonBody(req: import("node:http").IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

export function handleError(res: import("node:http").ServerResponse, error: unknown) {
  if (error instanceof ZodError) {
    json(res, 400, {
      error: "Validation error",
      details: error.issues,
    });
    return;
  }

  if (error instanceof Error) {
    json(res, 400, { error: error.message });
    return;
  }

  json(res, 500, { error: "Unknown error" });
}
