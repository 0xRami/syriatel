type SyriatelTemplateLanguage = "ar" | "en";
type SyriatelTemplateParams = Array<string | number | boolean>;
type SyriatelRecipientInput = string | string[];

interface SendSyriatelTemplateInput {
  templateCode: string;
  to: SyriatelRecipientInput;
  params?: SyriatelTemplateParams | string | number;
  paramList?: string | number;
  sender?: string;
}

interface SendSyriatelTemplateResult {
  success: boolean;
  httpStatus: number;
  providerResponse: string;
  providerUrl: string;
  to: string;
  paramList: string;
  templateCode: string;
}

export type {
  SendSyriatelTemplateInput,
  SendSyriatelTemplateResult,
  SyriatelRecipientInput,
  SyriatelTemplateLanguage,
  SyriatelTemplateParams
};
