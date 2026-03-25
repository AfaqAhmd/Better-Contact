# Better Contact Phone Lookup Web App

A clean single-page Next.js 14 app that securely looks up contact phone numbers using Better Contact's async enrichment API.  
The Better Contact API key is used only on the server in `/api/find-phone`.

## Tech Stack

- Next.js 14 (App Router)
- JavaScript
- Tailwind CSS
- Server API Route (`app/api/find-phone/route.js`)

## Project Structure

- `app/page.js` - Main page layout
- `components/PhoneLookupForm.js` - Client form UI and result rendering
- `app/api/find-phone/route.js` - Secure server-side request + polling flow
- `lib/bettercontact.js` - Reusable Better Contact helpers
- `.env.local.example` - Environment variable example

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env example and add your key:

   ```bash
   cp .env.local.example .env.local
   ```

3. Set your Better Contact API key in `.env.local`:

   ```env
   BETTERCONTACT_API_KEY=your_real_key_here
   ```

### Optional: Freeze Mode (for testing the UI animation)

If you want to test the “scraping” animation without calling Better Contact, set:

```env
BETTERCONTACT_FREEZE=true
BETTERCONTACT_FREEZE_MODE=found   # found | not_found
BETTERCONTACT_FREEZE_DELAY_MS=12000
BETTERCONTACT_FREEZE_PHONE=+1 (555) 123-4567
```

When you’re ready to use the real API again, set `BETTERCONTACT_FREEZE=false`.

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Request Flow (How It Works)

1. User enters contact details on the form.
2. Client sends a `POST` request to `/api/find-phone`.
3. Server validates input (requires at least one of `fullName`, `email`, or `linkedinUrl`).
4. Server splits `fullName` into `first_name` and `last_name`.
5. Server submits async enrichment request to:
   - `POST https://app.bettercontact.rocks/api/v2/async`
   - Body includes:
     - `enrich_email_address: false`
     - `enrich_phone_number: true`
6. Server reads `request_id` from Better Contact response.
7. Server polls:
   - `GET https://app.bettercontact.rocks/api/v2/async/{request_id}`
   - every 2.5 seconds
   - up to 20 attempts
8. Server stops polling when status is completed/terminated, extracts phone, and returns final JSON to frontend.

## Notes

- Better Contact enrichment is asynchronous, so polling is required.
- API key must stay server-side and never be exposed in browser code.
- The API route includes robust error responses for:
  - invalid input
  - upstream API failure
  - timeout while polling
  - unexpected internal errors

## Example Success Response

```json
{
  "success": true,
  "found": true,
  "phone": "+1...",
  "status": "terminated",
  "requestId": "abc123",
  "raw": {}
}
```
