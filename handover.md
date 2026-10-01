# admin (travel agency admin) — handover (2026-10-01)

Work was **paused with uncommitted changes** because the session context was filling. The code typechecks and lints; it has **not been clicked through in a browser** and is **not committed**.

- Branch: `master`. Last commit: `803bdd6  some change` (nothing from this session is committed here).
- **Uncommitted** (all part of one feature, the forgot-password page):
  - `src/app/forgot-password/` — new: `page.tsx`, `actions.ts`, `ForgotPasswordForm.tsx`
  - `src/app/login/LoginForm.tsx` — the old `login/page.tsx`, moved with `git mv`, now takes a `notice` prop and has a "Forgot password?" link
  - `src/app/login/page.tsx` — new thin **server** page that reads `?reset=1` and passes the banner text down
  - `src/proxy.ts` — `PUBLIC_PATHS = {'/login','/forgot-password'}`; without this the new page redirects straight back to `/login`
- Checks run: `npx tsc --noEmit` exit 0; `npx eslint src/app/forgot-password src/app/login src/proxy.ts --max-warnings=0` exit 0.

## What this app is
The E&S Travel Mongolia tenant admin (Next.js, React 19, server actions, Tailwind with custom tokens such as `bg-canvas`, `bg-panel`, `text-status-cancelled-text`). Runs on **:3001** (launch config `admin`). It talks to **digitalservice** (`API_BASE_URL`, default `http://localhost:8080/api/v1`) with the tenant's `TENANT_API_KEY`, which is **server-side only**: `src/lib/api/client.ts` must only be imported from server code.

> `AGENTS.md` in sibling Next apps says this Next version has breaking changes; read `node_modules/next/dist/docs/` before inventing patterns, and prefer copying what existing pages here already do.

## The feature
Self-service "forgot password" for the travel admin's users, mirroring the core admin's. Spec and plan live in **tenantcore**:
- `tenantcore/docs/superpowers/specs/2026-10-01-tenant-user-password-reset-design.md`
- `tenantcore/docs/superpowers/plans/2026-10-01-tenant-user-password-reset.md` (this app is **Task 5**)

Behaviour: step 1 asks for an email and always answers with wording that is true whether or not the account exists; step 2 takes the 6-digit code and a new password; success redirects to `/login?reset=1`, which shows "Password changed". The code step is its own component (`CodeStep`) so one attempt's error cannot carry into the next. Mismatched or short passwords are caught **before** the request, because the code is burned after 5 wrong guesses. `503` shows "Email isn't set up on this server"; `429` shows "Too many attempts". The backend is `POST /password-reset/request` and `/confirm` in digitalservice (committed, `cd75030`).

## What is left (plan Task 5, steps 3–4)
1. Start digitalservice (**:8080**), tenantcore (**:8092**, for mail) and this app (**:3001**).
2. Click through, checking each of these:
   - `/login` shows "Forgot password?" and it leads to `/forgot-password` (signed out). An unknown address advances to the code step with the same wording as a real one.
   - Mismatched passwords show an error **without** a request (watch the digitalservice log).
   - A wrong code shows exactly "that code is not valid — request a new one".
   - "Use a different email or send a new code" then a fresh request shows **no stale error**.
   - `/login?reset=1` shows the "Password changed" banner.
3. Commit: `feat: add a forgot-password page to the travel admin`.
4. Then **digitalservice Task 6** (the live reset with a real email). Use a **throwaway tenant and user with the email `munkherdene@bdsec.mn`**. **Do not complete a reset for E&S's real admin** (`enkhjin.erdenebuyan@gmail.com`): it would change their real password.

## Known limits and gotchas
- A reset does not end sessions already signed in (stateless tokens).
- Mail depends on tenantcore's Gmail App Password being valid (it is, as of today) and on `TENANTCORE_URL`/`TENANTCORE_SERVICE_KEY` in **digitalservice's** `.env`. Check `GET localhost:8080/readyz` for `password_reset: true`.
- Style here is **single quotes, no semicolons**. The core admin (`innonomads/admin`) uses double quotes and semicolons; don't mix.
- The 401 handling in this app redirects to `/login`; the reset actions deliberately carry no token, so a wrong code stays on the page.
- Stale `admin_session` cookies are harmless but make `/login` redirect to `/` for signed-in users.
