# QuoteFast

AI-powered quote generator for service businesses. Owners describe a job → AI generates line items from their service catalog → professional PDF quote sent to client via shareable link → client approves/declines online.

## Stack
- Frontend: React + Tailwind + Vite (/client)
- Backend: Node.js + Express (/server)
- Database: MongoDB + Mongoose
- AI: Claude API (claude-sonnet-4-20250514)
- PDF: Puppeteer (puppeteer-core + @sparticuz/chromium)
- Auth: bcrypt + JWT


## Design Rules
- Use the frontend-design skill for all UI
- Fonts: "DM Sans" (body), "Playfair Display" (headings)
- Colors: cream backgrounds (#FDFBF7), navy (#1B2A4A), gold accents (#D4A843)
- Mobile-first — primary users are tradespeople on phones at job sites
- Large tap targets, card layouts over tables on mobile
- No generic AI aesthetics. Warm, professional, trustworthy.

## Key Principles
- "Describe job" to "quote sent" must take under 60 seconds
- Quotes must look professional enough for a $10k job
- When in doubt, keep it simple — users are not technical
- If AI fails, always fall back to manual entry

## Env Vars
MONGODB_URI, ANTHROPIC_API_KEY, JWT_SECRET, FRONTEND_URL, PORT, SKIP_AI

## Deployment
- Backend: Railway (root /server)
- Frontend: Vercel (root /client, VITE_API_URL points to Railway)

## Visual QA / Frontend Testing
When verifying UI changes, write and run a Playwright script directly. Do NOT use Playwright MCP.

Scripts should:
- Launch a fresh browser context (no persistent session)
- Capture console.error and console.warn
- Take screenshots at key states
- Fail loudly if any console errors are detected
- Target localhost:5173 (or whatever the dev server port is)
