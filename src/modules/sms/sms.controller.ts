import type { NextFunction, Request, Response } from "express";
import { getAvailableTemplates, normalizeLanguage, sendTemplateSms } from "./sms.service";
import type { TemplateSmsBody, TemplateSmsParams } from "./sms.types";

async function sendTemplateSmsHandler(
  req: Request<TemplateSmsParams, unknown, TemplateSmsBody>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const forcedLanguage = req.params.language ? normalizeLanguage(req.params.language) : "";
  const language = forcedLanguage || normalizeLanguage(req.body.language);

  if (!language) {
    res.status(400).json({
      success: false,
      error: "language must be one of: ar, arabic, en, english"
    });
    return;
  }

  try {
    const result = await sendTemplateSms(language, req.body);
    const statusCode = result.success ? 200 : 502;

    res.status(statusCode).json({
      success: result.success,
      template: language,
      templateCode: result.templateCode,
      to: result.to,
      providerResponse: result.providerResponse
    });
  } catch (error) {
    next(error);
  }
}

function listTemplatesHandler(_req: Request, res: Response): void {
  res.json({
    success: true,
    templates: getAvailableTemplates()
  });
}

export { listTemplatesHandler, sendTemplateSmsHandler };
