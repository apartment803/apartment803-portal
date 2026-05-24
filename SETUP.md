# Apartment 803 — Client Portal
## Complete Setup Guide for Replit

---

## WHAT THIS IS
A full white-label client portal for your Retell AI voice agent business.
- **Your admin view** → manage all clients, set minute limits, add/suspend accounts
- **Client view** → each client logs in and sees their call logs, analytics, agent performance
- **Retell AI powered** → call data flows in automatically via webhooks

---

## STEP 1 — Set up Supabase (5 minutes)

1. Go to **supabase.com** → Sign up → Create New Project
2. Name it "apartment803" → pick a strong database password → create
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** → New Query → paste the contents of `SUPABASE_SCHEMA.sql` → Run
5. Go to **Settings → API** → copy these 3 values (you'll need them in Step 3):
   - Project URL
   - anon public key  
   - service_role secret key

---

## STEP 2 — Import to Replit (3 minutes)

1. Go to **replit.com** → sign in → Create Repl
2. Click **Import from GitHub**
3. Paste your GitHub repo URL (or upload this folder)
4. Replit will detect Next.js and configure automatically

---

## STEP 3 — Add Secrets in Replit (2 minutes)

Click the **lock icon (Secrets)** in the left sidebar → add each:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `RETELL_API_KEY` | From retellai.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your Replit URL (e.g. https://apartment803.repl.co) |
| `RETELL_WEBHOOK_SECRET` | Any random string (e.g. apt803secret2026) |

---

## STEP 4 — Create your admin account (5 minutes)

1. Go to Supabase → **Authentication → Users → Add User**
2. Enter your email and a strong password → Create
3. Copy the user's UUID (shown after creation)
4. Go to **SQL Editor** → run:
   ```sql
   INSERT INTO users (id, email, role) 
   VALUES ('<paste-your-uuid-here>', 'you@youremail.com', 'admin');
   ```
5. Go to your portal URL → log in → you'll land on the admin panel ✓

---

## STEP 5 — Connect Retell AI webhooks (3 minutes)

1. Go to **retellai.com → Dashboard → Settings → Webhooks**
2. Add webhook URL: `https://your-replit-url.repl.co/api/webhooks/retell`
3. Select event: **call_ended** → Save
4. Every call that ends will now automatically appear in your portal ✓

---

## STEP 6 — Add your first client (2 minutes)

1. In your admin panel → click **+ New Client**
2. Enter their business name, email, and minute limit (based on their package)
3. The system creates their login and sends a password reset email
4. They log in → they see their branded Apartment 803 portal with their data only ✓

---

## STEP 7 — Add phone numbers per client

For call data to route correctly, map each Retell phone number to a client:

```sql
INSERT INTO client_phone_numbers (client_id, phone_number, agent_name, retell_agent_id)
VALUES (
  '<client-uuid-from-clients-table>',
  '+1XXXXXXXXXX',
  'AI Receptionist',
  'your-retell-agent-id'
);
```

---

## PACKAGE → MINUTE LIMITS

| Package | Monthly Minutes |
|---------|----------------|
| Always Answered ($397/mo) | 300 min |
| Intake & Convert ($647/mo) | 600 min |
| Full AI Front Desk ($1,097/mo) | 1,200 min |

---

## YOUR PORTAL URLS

| Page | URL |
|------|-----|
| Login | yourdomain.com/ |
| Admin — Clients | yourdomain.com/admin/clients |
| Admin — Overview | yourdomain.com/admin/overview |
| Client — Call Logs | yourdomain.com/dashboard/calls |
| Client — Analytics | yourdomain.com/dashboard/analytics |
| Client — Agents | yourdomain.com/dashboard/agents |
| Retell Webhook | yourdomain.com/api/webhooks/retell |

---

## CUSTOM DOMAIN (optional)

1. Buy a domain (e.g. portal.apartment803.com) at Namecheap (~$12/yr)
2. In Replit → Settings → Custom Domains → add your domain
3. Update `NEXT_PUBLIC_APP_URL` secret to your new domain
4. Done — clients log in at your branded domain ✓

---

## QUESTIONS?
Every page, component, and API route is documented inline.
To customize anything — just tell Claude what you want changed.
