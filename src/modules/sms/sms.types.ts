import type { SyriatelTemplateLanguage } from "../../clients/syriatel";

interface TemplateSmsBody {
  to?: string | string[];
  language?: string;
  params?: Array<string | number | boolean> | string | number;
  paramList?: string | number;
  sender?: string;
}

interface TemplateSmsParams {
  language?: string;
}

export type { SyriatelTemplateLanguage as SmsTemplateLanguage, TemplateSmsBody, TemplateSmsParams };
