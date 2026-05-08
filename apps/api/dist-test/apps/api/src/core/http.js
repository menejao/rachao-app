"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = json;
exports.parseJsonBody = parseJsonBody;
exports.handleError = handleError;
const zod_1 = require("zod");
function json(res, status, payload) {
    res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}
function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
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
            }
            catch {
                reject(new Error("Invalid JSON body"));
            }
        });
        req.on("error", reject);
    });
}
function handleError(res, error) {
    if (error instanceof zod_1.ZodError) {
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
