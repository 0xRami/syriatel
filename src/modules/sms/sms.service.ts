import config from "../../config";
import { sendSyriatelTemplateSms } from "../../clients/syriatel";
import type { SendSyriatelTemplateResult } from "../../clients/syriatel";
import type { SmsTemplateLanguage, TemplateSmsBody } from "./sms.types";

function normalizeLanguage(value?: string): SmsTemplateLanguage | "" {
  const language = String(value || "").trim().toLowerCase();

  if (language === "ar" || language === "arabic") return "ar";
  if (language === "en" || language === "english") return "en";

  return "";
}

function getTemplateCode(language: SmsTemplateLanguage): string {
  return config.syriatel.templates[language];
}

async function sendTemplateSms(
  language: SmsTemplateLanguage,
  body: TemplateSmsBody
): Promise<SendSyriatelTemplateResult> {
  return sendSyriatelTemplateSms({
    templateCode: getTemplateCode(language),
    to: body.to || "",
    params: body.params,
    paramList: body.paramList,
    sender: body.sender
  });
}

function getAvailableTemplates(): Record<SmsTemplateLanguage, string> {
  return {
    ar: config.syriatel.templates.ar,
    en: config.syriatel.templates.en
  };
}

export { getAvailableTemplates, normalizeLanguage, sendTemplateSms };
