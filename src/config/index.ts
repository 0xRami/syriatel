import dotenv from "dotenv";

dotenv.config();

type RuntimeEnv = "development" | "test" | "production" | string;

interface SyriatelConfig {
  baseUrl: string;
  username: string;
  password: string;
  sender: string;
  templates: {
    ar: string;
    en: string;
  };
  timeoutMs: number;
  paramSeparator: string;
}

interface AppConfig {
  nodeEnv: RuntimeEnv;
  port: number;
  internalApiKey: string;
  syriatel: SyriatelConfig;
}

function optionalInt(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultValue;

  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is required. Create a .env file from .env.example and set the required values.`);
  }

  return value.trim();
}

const nodeEnv = process.env.NODE_ENV || "development";
const internalApiKey = process.env.INTERNAL_API_KEY || "";

if (nodeEnv === "production" && !internalApiKey) {
  throw new Error("INTERNAL_API_KEY is required in production.");
}

const config: AppConfig = {
  nodeEnv,
  port: optionalInt("PORT", 3000),
  internalApiKey,
  syriatel: {
    baseUrl: (process.env.SYRIATEL_BASE_URL || "https://bms.syriatel.sy/API").replace(/\/+$/, ""),
    username: required("SYRIATEL_USERNAME"),
    password: required("SYRIATEL_PASSWORD"),
    sender: required("SYRIATEL_SENDER"),
    templates: {
      ar: required("SYRIATEL_TEMPLATE_AR"),
      en: required("SYRIATEL_TEMPLATE_EN")
    },
    timeoutMs: optionalInt("SYRIATEL_TIMEOUT_MS", 10000),
    paramSeparator: process.env.SYRIATEL_PARAM_SEPARATOR || ";"
  }
};

export default config;
export type { AppConfig, SyriatelConfig };
