import config from "../../config";
import { HttpError } from "../../shared/errors/httpError";
import {
  buildTemplateUrl,
  isSuccessfulProviderResponse,
  normalizeParamList,
  normalizeRecipients,
  redactUrl
} from "./syriatel.utils";
import type { SendSyriatelTemplateInput, SendSyriatelTemplateResult } from "./syriatel.types";

async function sendSyriatelTemplateSms({
  templateCode,
  to,
  params,
  paramList,
  sender
}: SendSyriatelTemplateInput): Promise<SendSyriatelTemplateResult> {
  const normalizedTo = normalizeRecipients(to);
  const normalizedParamList = normalizeParamList({ params, paramList });

  if (!templateCode) {
    throw new HttpError("Template code is required.", 400);
  }

  if (!normalizedTo) {
    throw new HttpError("Recipient phone number is required.", 400);
  }

  if (!normalizedParamList) {
    throw new HttpError("Template parameter list is required.", 400);
  }

  const url = buildTemplateUrl({
    templateCode,
    to: normalizedTo,
    paramList: normalizedParamList,
    sender
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.syriatel.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });

    const providerResponse = (await response.text()).trim();
    const success = response.ok && isSuccessfulProviderResponse(providerResponse);

    return {
      success,
      httpStatus: response.status,
      providerResponse,
      providerUrl: redactUrl(url),
      to: normalizedTo,
      paramList: normalizedParamList,
      templateCode
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new HttpError("Syriatel request timed out.", 504);
    }

    throw new HttpError("Failed to reach Syriatel API.", 502, {
      cause: error
    });
  } finally {
    clearTimeout(timeout);
  }
}

export {
  sendSyriatelTemplateSms
};
