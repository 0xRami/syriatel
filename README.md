# Syriatel SMS Integration

Small Node/Express service that your main backend can call to send Syriatel BMS template SMS messages.

This service exists as a separate deployable because Syriatel BMS access may need to run from a VPS inside the allowed Syriatel/Syria network.

## Integration Summary

Your main backend should call this service, not Syriatel directly:

```text
Main Backend -> Syriatel SMS Service -> Syriatel BMS API
```

Recommended endpoint:

```http
POST /api/sms/template
```

The request body decides whether to use the Arabic or English template.

## Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required values:

```env
NODE_ENV=production
PORT=3000

INTERNAL_API_KEY=change-this-to-a-strong-secret

SYRIATEL_BASE_URL=https://bms.syriatel.sy/API
SYRIATEL_USERNAME=your-syriatel-user
SYRIATEL_PASSWORD=your-syriatel-password
SYRIATEL_SENDER=Shaheen App

SYRIATEL_TEMPLATE_AR=ShaheenApp_T1
SYRIATEL_TEMPLATE_EN=ShaheenApp_T2

SYRIATEL_TIMEOUT_MS=10000
SYRIATEL_PARAM_SEPARATOR=;
```

Notes:

- `INTERNAL_API_KEY` protects this service from public unauthenticated calls.
- `SYRIATEL_TEMPLATE_AR` is the Arabic template code, currently `ShaheenApp_T1`.
- `SYRIATEL_TEMPLATE_EN` is the English template code, currently `ShaheenApp_T2`.
- `SYRIATEL_PARAM_SEPARATOR` is used only when `params` contains multiple values.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell:

```powershell
npm install
copy .env.example .env
npm run dev
```

## Production Commands

Build locally or on the VPS:

```bash
npm run build
```

Run compiled app:

```bash
npm start
```

For low-memory VPS deployments, build locally and upload the built `dist/` folder, then install only production dependencies on the VPS:

```bash
npm ci --omit=dev
npm start
```

## Authentication

Every SMS endpoint requires the internal API key.

Use either:

```http
x-api-key: your-internal-api-key
```

or:

```http
Authorization: Bearer your-internal-api-key
```

Unauthorized requests return:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Endpoints

### Health Check

```http
GET /health
```

Success response:

```json
{
  "success": true,
  "service": "syriatel-sms-integration",
  "status": "ok"
}
```

### Send Template SMS

Recommended integration endpoint:

```http
POST /api/sms/template
Content-Type: application/json
x-api-key: your-internal-api-key
```

English template:

```json
{
  "to": "9639XXXXXXXX",
  "language": "en",
  "params": ["12345"]
}
```

Arabic template:

```json
{
  "to": "9639XXXXXXXX",
  "language": "ar",
  "params": ["12345"]
}
```

`language` accepts:

```text
ar, arabic, en, english
```

`to` can be one phone number:

```json
{
  "to": "9639XXXXXXXX",
  "language": "en",
  "params": ["12345"]
}
```

or multiple phone numbers:

```json
{
  "to": ["9639XXXXXXXX", "9639YYYYYYYY"],
  "language": "en",
  "params": ["12345"]
}
```

Multiple recipients are sent to Syriatel as a semicolon-delimited list.

You can also send a preformatted `paramList` instead of `params`:

```json
{
  "to": "9639XXXXXXXX",
  "language": "en",
  "paramList": "12345"
}
```

For the current OTP template, `params: ["12345"]` is the simplest option.

### Optional Convenience Routes

The service also supports these shortcuts:

```http
POST /api/sms/template/en
POST /api/sms/template/ar
```

When using these routes, `language` is taken from the URL and can be omitted from the body.

For new backend integration, prefer `POST /api/sms/template`.

## Successful Response

On success, Syriatel returns a numeric id in `providerResponse`.

```json
{
  "success": true,
  "template": "en",
  "templateCode": "ShaheenApp_T2",
  "to": "9639XXXXXXXX",
  "providerResponse": "67786561"
}
```

## Error Responses

Missing or invalid language:

```json
{
  "success": false,
  "error": "language must be one of: ar, arabic, en, english"
}
```

Missing recipient:

```json
{
  "success": false,
  "error": "Recipient phone number is required."
}
```

Missing template params:

```json
{
  "success": false,
  "error": "Template parameter list is required."
}
```

Syriatel/provider error:

```json
{
  "success": false,
  "template": "en",
  "templateCode": "ShaheenApp_T2",
  "to": "9639XXXXXXXX",
  "providerResponse": "Sender doesn't exist or doesn't belong to the user."
}
```

Provider errors return HTTP `502`.

## Testing With curl

From Linux/macOS/VPS:

```bash
curl -X POST "http://localhost:3000/api/sms/template" \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-internal-api-key" \
  -d '{"to":"9639XXXXXXXX","language":"en","params":["12345"]}'
```

From Windows PowerShell, prefer a JSON file because inline JSON may lose quotes before reaching `curl.exe`.

Create `body.json`:

```json
{"to":"9639XXXXXXXX","language":"en","params":["12345"]}
```

Then run:

```powershell
curl.exe -X POST "http://localhost:3000/api/sms/template" `
  -H "Content-Type: application/json" `
  -H "x-api-key: your-internal-api-key" `
  --data-binary "@body.json"
```

If the VPS is exposed through port `80`:

```powershell
curl.exe -X POST "http://your-sms-service-host/api/sms/template" `
  -H "Content-Type: application/json" `
  -H "x-api-key: your-internal-api-key" `
  --data-binary "@body.json"
```

## Example Backend Call

Node.js example from your main backend:

```ts
async function sendOtpSms() {
  const response = await fetch("https://your-sms-service-host/api/sms/template", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SYRIATEL_SMS_SERVICE_API_KEY!
    },
    body: JSON.stringify({
      to: "9639XXXXXXXX",
      language: "en",
      params: ["12345"]
    })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.providerResponse || result.error || "Failed to send SMS");
  }

  return result;
}
```

## Phone Number Format

Use Syriatel international format without spaces or `+`:

```text
9639XXXXXXXX
```

Avoid:

```text
+963 9XX XXX XXX
099XXXXXXX
```

If Syriatel confirms that local `09...` numbers are accepted for templates, they can be used, but `963...` is safer.

## Deployment Notes

Recommended production setup:

```text
Nginx :80/:443 -> Node app :3000
```

Keep Node on `PORT=3000` and expose Nginx on `80` or `443`.

If port `3000` is blocked externally but `80` works, use Nginx as a reverse proxy instead of running Node directly on port `80`.

If the VPS is very small and processes get `Killed`, add swap:

```bash
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Project Structure

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

## Troubleshooting

`SYRIATEL_USERNAME is required`

The `.env` file is missing or does not contain the required Syriatel values.

`Unexpected token t in JSON at position 1`

Your shell likely sent invalid JSON like `{to:...}`. Use `--data-binary "@body.json"` in PowerShell.

External `:3000` times out, but local health check works

The app is running, but an upstream firewall/provider rule is blocking port `3000`. Use Nginx on port `80` or ask the provider to open/whitelist the port.

`listen EACCES: permission denied 0.0.0.0:80`

Normal users cannot bind to port `80`. Use Nginx in front of Node, or run with the correct system capability.
