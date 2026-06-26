import config from "../../config";
import type { SendSyriatelTemplateInput } from "./syriatel.types";

const SUCCESS_MESSAGES = new Set([
  "Done Successfully.",
  "Done Successfully"
]);

function normalizeRecipients(to: SendSyriatelTemplateInput["to"]): string {
  if (Array.isArray(to)) {
    return to.map((item) => String(item).trim()).filter(Boolean).join(";");
  }

  return String(to || "").trim();
}

function normalizeParamList({
  params,
  paramList
}: Pick<SendSyriatelTemplateInput, "params" | "paramList">): string {
  if (paramList !== undefined && paramList !== null) {
    return String(paramList).trim();
  }

  if (Array.isArray(params)) {
    return params.map((item) => String(item).trim()).join(config.syriatel.paramSeparator);
  }

  if (params !== undefined && params !== null) {
    return String(params).trim();
  }

  return "";
}

function isSuccessfulProviderResponse(body: string): boolean {
  const trimmed = body.trim();

  if (SUCCESS_MESSAGES.has(trimmed)) return true;

  // Some BMS send APIs return a numeric job id on success.
  return /^\d+$/.test(trimmed);
}

function buildTemplateUrl({
  templateCode,
  to,
  paramList,
  sender
}: {
  templateCode: string;
  to: string;
  paramList: string;
  sender?: string;
}): URL {
  const url = new URL(`${config.syriatel.baseUrl}/SendTemplateSMS.aspx`);

  url.searchParams.set("user_name", config.syriatel.username);
  url.searchParams.set("password", config.syriatel.password);
  url.searchParams.set("template_code", templateCode);
  url.searchParams.set("param_list", paramList);
  url.searchParams.set("sender", sender || config.syriatel.sender);
  url.searchParams.set("to", to);

  return url;
}

function redactUrl(url: URL): string {
  const redacted = new URL(url.toString());
  redacted.searchParams.set("password", "***");
  return redacted.toString();
}

export {
  buildTemplateUrl,
  isSuccessfulProviderResponse,
  normalizeParamList,
  normalizeRecipients,
  redactUrl
};
