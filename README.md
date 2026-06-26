# Syriatel SMS Integration

Small Express service that wraps Syriatel BMS template SMS calls for your main backend.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Fill `.env` with the real Syriatel credentials and a strong `INTERNAL_API_KEY`.

Required values:

```env
INTERNAL_API_KEY=your-internal-key
SYRIATEL_USERNAME=your-syriatel-user
SYRIATEL_PASSWORD=your-syriatel-password
SYRIATEL_SENDER=Shaheen App
SYRIATEL_TEMPLATE_AR=ShaheenApp_T1
SYRIATEL_TEMPLATE_EN=ShaheenApp_T2
```

For production:

```bash
npm run build
npm start
```

If startup fails with `SYRIATEL_USERNAME is required`, the `.env` file is missing or does not contain the required Syriatel values.

## Structure

```text
src/
  app.ts                         Express app composition
  server.ts                      HTTP server bootstrap
  config/                        Environment and runtime config
  clients/syriatel/              Syriatel BMS API client and provider types
  modules/health/                Health endpoint
  modules/sms/                   Internal SMS API routes, controller, and service
  shared/errors/                 Shared application errors
  shared/middleware/             Shared Express middleware
```

## Auth

Every SMS endpoint requires the internal API key:

```http
x-api-key: your-internal-key
```

or:

```http
Authorization: Bearer your-internal-key
```

## Endpoints

### Health

```http
GET /health
```

### Send Template SMS

Arabic uses `SYRIATEL_TEMPLATE_AR` (`ShaheenApp_T1`).
English uses `SYRIATEL_TEMPLATE_EN` (`ShaheenApp_T2`).

```http
POST /api/sms/template
Content-Type: application/json
x-api-key: your-internal-key

{
  "to": "09xxxxxxxx",
  "language": "ar",
  "params": ["12345"]
}
```

`language` accepts `ar`, `arabic`, `en`, or `english`.

You can also send a raw `paramList` if Syriatel expects a pre-formatted value:

```json
{
  "to": "09xxxxxxxx",
  "language": "en",
  "paramList": "12345"
}
```

### Convenience Endpoints

```http
POST /api/sms/template/ar
POST /api/sms/template/en
```

Example:

```bash
curl.exe -X POST "http://localhost:3000/api/sms/template/en" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: your-internal-key" ^
  --data-binary "@examples/send-template-en.json"
```

In PowerShell, prefer the example JSON files with `--data-binary "@examples/send-template-en.json"` because inline JSON can lose its quotes before it reaches `curl.exe`.

## Response

```json
{
  "success": true,
  "template": "en",
  "templateCode": "ShaheenApp_T2",
  "to": "09xxxxxxxx",
  "providerResponse": "Done Successfully."
}
```

If Syriatel returns an error message, this service responds with `502` and includes the provider message without exposing credentials.
