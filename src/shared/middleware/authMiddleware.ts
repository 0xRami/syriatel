import type { NextFunction, Request, Response } from "express";
import config from "../../config";

function extractBearerToken(headerValue?: string): string {
  if (!headerValue) return "";

  const [scheme, token] = headerValue.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token || "" : "";
}

function requireInternalApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!config.internalApiKey && config.nodeEnv !== "production") {
    next();
    return;
  }

  const apiKey = req.get("x-api-key") || extractBearerToken(req.get("authorization"));

  console.debug("Received API key:", apiKey ? "****" : "(none)");

  if (apiKey !== config.internalApiKey) {
    res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
    return;
  }

  next();
}

export { requireInternalApiKey };
