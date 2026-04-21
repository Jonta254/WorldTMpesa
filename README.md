# WorldTMpesa

This repository contains `TMpesa`, a React + Vite World mini app for manually exchanging crypto and Kenyan Shillings through M-Pesa. It is frontend-only for now and stores users and orders in `localStorage`.

## Features

- Local signup and login
- World App wallet-auth entry path
- Dashboard with quick actions
- Sell flow: crypto to KES with in-mini-app WLD send
- Buy flow: M-Pesa to crypto
- Orders page with status tracking
- Admin simulation page for manual confirmation
- Admin-editable rates, receiver wallet, M-Pesa details, and support email
- Gmail support and payment-delay actions for users

## Product Context

- Built to run as a World App mini app with MiniKit integration
- Keeps a browser preview mode so the UI can still be tested outside World App
- Uses World App wallet auth as the preferred entry path, with local login only as a fallback for development
- Uses World `Pay` for the WLD sell flow inside the mini app when opened in World App
- Includes repo assets in `public/` for favicon, icon, manifest, and content-card placeholder
- Current version is still frontend-only and does not yet verify SIWE or payment status on a backend

## Important Prototype Note

- The current wallet auth flow is a frontend prototype only
- Before submission or production use, add backend SIWE nonce generation and signature verification
- Before production payouts, verify `Pay` transactions on a backend and whitelist the receiver wallet in the World Developer Portal
- World's docs recommend Wallet Auth as the primary login flow for mini apps and backend verification for the returned payloads

## Review-Safe Naming

- The repository remains `WorldTMpesa` for continuity
- The in-app display name is `TMpesa` because World's review guidelines say mini app names should not use `World`

## Source Structure

- `src/config`: app-level constants and storage keys
- `src/services`: auth, orders, local storage, and World App integration
- `src/hooks`: shared UI logic such as the order flow state machine
- `src/routes`: top-level route definitions
- `src/components/auth`: auth-only reusable UI
- `src/components/layout`: shell and route protection
- `src/components/orders`: order cards and status display
- `src/pages/auth`: login and signup screens
- `src/pages/app`: dashboard, orders, and admin screens
- `src/pages/trade`: buy and sell transaction flows

## Local Storage Notes

- Users are stored locally in the browser
- Orders are stored locally in the browser
- No backend or external API is used yet

## Demo Admin Account

- Phone: `0700000000`
- Password: `admin123`

## Run Locally

1. Install dependencies with `npm install`
2. Start the app with `npm run dev`
3. Open the Vite local URL in your browser
4. Open the deployed URL inside World App when you want to test MiniKit behavior

## GitHub Ready

This folder is prepared to be pushed to GitHub.

- `node_modules` and build output are ignored in [.gitignore](C:/Users/ADMIN/Documents/Codex/2026-04-19-i-need-to-star-a-new/.gitignore)
- The project root is already cleanly structured for a repo
- You can initialize git and push as soon as `git` is installed on your machine

### Quick Start With Git

If `git` is available on your machine, run:

```bash
git init
git add .
git commit -m "Initial commit for WorldTMpesa"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Open In Editor

If VS Code is installed, you can open the project with:

```bash
code .
```

### GitHub Desktop Option

If you prefer GitHub Desktop:

1. Add this folder as an existing repository after running `git init`
2. Publish the repository to GitHub from GitHub Desktop
3. Continue syncing changes visually

## Stack

- React
- React Router
- Vite
- MiniKit
- localStorage
