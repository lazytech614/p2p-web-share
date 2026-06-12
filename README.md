# P2PWebShare

> **Browser-to-browser peer-to-peer file sharing — no server storage, no size limits, no accounts required.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://p2p-web-share-web.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-89%25-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-blueviolet?logo=turborepo)](https://turborepo.dev)
[![pnpm](https://img.shields.io/badge/Package%20Manager-pnpm-orange?logo=pnpm)](https://pnpm.io)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
  - [Building for Production](#building-for-production)
- [Apps & Packages](#apps--packages)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

**WebShareP2P** is a zero-upload, peer-to-peer file transfer application that runs entirely in the browser. Users create a room, share the generated link, and files travel **directly** between browsers over WebRTC — the server only facilitates the initial handshake (signaling) and never touches your files.

🔗 **Live App:** [p2p-web-share-web.vercel.app](https://p2p-web-share-web.vercel.app)

---

## Features

- 🚀 **True P2P transfer** — files never touch a server; data flows directly peer-to-peer
- 📂 **Any file type** — documents, images, videos, archives, executables — anything goes
- ♾️ **No size limit** — transfer large files without cloud storage restrictions
- ⚡ **Real-time transfer stats** — live progress percentage, transfer speed, and ETA
- 🔗 **Room-based sharing** — create a room and share the URL to invite the receiver
- 🔒 **Private by design** — no accounts, no sign-ups, no data stored on servers
- 🖥️ **Drag-and-drop UI** — simply drop a file onto the interface to start
- 📱 **Responsive** — works on desktop and mobile browsers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [Next.js](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | TailwindCSS |
| P2P Transport | Peerjs (via browser APIs / simple-peer or native) |
| Signaling | WebSocket server (signaling only, no file data) |
| Monorepo | [Turborepo](https://turborepo.dev) |
| Package Manager | [pnpm](https://pnpm.io) (v9) |
| Deployment | [Vercel](https://vercel.com) & [Render](https://render.com) |

---

## Project Structure

This is a **Turborepo monorepo** organised into `apps/` and `packages/`:

```
p2p-web-share/
├── apps/
│   ├── web/               # Main Next.js frontend application
│   └── server/            # Signaling server (WebSocket) for WebRTC handshake
├── packages/
│   ├── ui/                # @repo/ui — shared React component library
│   ├── eslint-config/     # @repo/eslint-config — shared ESLint configuration
│   └── typescript-config/ # @repo/typescript-config — shared tsconfig.json bases
├── .gitignore
├── .npmrc
├── package.json           # Root workspace scripts & devDependencies
├── pnpm-workspace.yaml    # pnpm workspace definition
├── turbo.json             # Turborepo pipeline configuration
└── README.md
```

### Key Directories

```
apps/web/
├── app/                   # Next.js App Router pages & layouts
├── components/            # React UI components (FileDropzone, TransferStats, RoomPanel, …)
├── hooks/                 # Custom React hooks (useWebRTC, useRoom, useTransfer, …)
├── lib/                   # Utility functions and WebRTC helpers
├── public/                # Static assets
└── styles/                # Global CSS

apps/server/
├── src/                   # WebSocket signaling server source
└── tsconfig.json
```

---

## How It Works

WebShareP2P uses the **WebRTC** protocol for peer-to-peer data transfer. Here's the flow:

```
Sender                    Signaling Server (WebSocket)              Receiver
  |                               |                                    |
  |── Create Room ──────────────> |                                    |
  |<── Room ID + Link ────────── |                                    |
  |                               |<── Join Room (via shared link) ── |
  |<── Receiver Joined ────────── |                                    |
  |── WebRTC Offer ─────────────> |──────────────────────────────────>|
  |<─────────────────────────────── WebRTC Answer ────────────────────|
  |── ICE Candidates ───────────> |──────────────────────────────────>|
  |<────────────────── ICE Candidates ───────────────────────────────|
  |                                                                    |
  |<══════════════ Direct P2P Data Channel (file bytes) ══════════════|
  |          (Server is NO LONGER involved in the transfer)           |
```

1. **Sender** creates a room; the server generates a unique room ID and returns a shareable link.
2. **Receiver** opens the link, joining the same room on the signaling server.
3. Both peers exchange **WebRTC offer/answer** and **ICE candidates** through the signaling server to negotiate a direct connection.
4. Once the **P2P data channel** is established, the signaling server steps out entirely.
5. The file is chunked and streamed directly from sender to receiver — no cloud involved.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** `>= 18`
- **pnpm** `>= 9`

Install pnpm globally if you haven't:

```bash
npm install -g pnpm@9
```

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/lazytech614/p2p-web-share.git
cd p2p-web-share
```

2. **Install all workspace dependencies:**

```bash
pnpm install
```

This installs dependencies for all apps and packages in the monorepo.

### Running Locally

Start all apps in development mode simultaneously:

```bash
pnpm dev
```

Or use Turborepo directly (if you have `turbo` installed globally):

```bash
turbo dev
```

To run only the frontend:

```bash
turbo dev --filter=web
```

To run only the signaling server:

```bash
turbo dev --filter=server
```

By default:
- **Web app** runs at `http://localhost:3000`
- **Signaling server** runs at `ws://localhost:<port>` (check `apps/server` for the configured port)

### Building for Production

Build all apps and packages:

```bash
pnpm build
```

Or with a filter:

```bash
turbo build --filter=web
```

Build outputs:
- `apps/web/.next/` — Next.js production build
- `apps/server/dist/` — Compiled signaling server

---

## Apps & Packages

### `apps/web`

The main user-facing application built with **Next.js** (App Router).

Key features:
- File drag-and-drop zone
- Room creation and joining
- Real-time transfer progress (%, speed, ETA)
- WebRTC peer connection management

### `apps/server`

A lightweight **WebSocket signaling server** written in TypeScript.

Its only responsibility is relaying WebRTC signaling messages (offers, answers, ICE candidates) between peers. It never receives or stores file data.

### `packages/ui` — `@repo/ui`

Shared React component library consumed by the `web` app. Contains reusable UI primitives styled consistently across the monorepo.

### `packages/eslint-config` — `@repo/eslint-config`

Shared ESLint configuration that extends `eslint-config-next` and `eslint-config-prettier`, ensuring consistent code style across all workspaces.

### `packages/typescript-config` — `@repo/typescript-config`

Shared `tsconfig.json` bases (base, Next.js, React library) used throughout the monorepo to keep TypeScript settings consistent.

---

## Available Scripts

Run these from the **root** of the monorepo:

| Script | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode (with Turbo) |
| `pnpm build` | Build all apps and packages for production |
| `pnpm lint` | Lint all workspaces |
| `pnpm format` | Format all `*.ts`, `*.tsx`, `*.md` files with Prettier |
| `pnpm check-types` | Run TypeScript type checking across all workspaces |

Filter to a specific workspace with `--filter`:

```bash
# Lint only the web app
turbo lint --filter=web

# Build only the server
turbo build --filter=server
```

---

## Deployment

The project is deployed on **Vercel**.

### Deploying the Web App

1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `apps/web` (or configure the Vercel project to use the monorepo preset).
3. Vercel will auto-detect Next.js and configure the build command as `turbo build --filter=web`.

### Deploying the Signaling Server

The WebSocket signaling server (`apps/server`) can be deployed to any Node.js-compatible host:

- **Railway** — recommended for WebSocket support
- **Render**
- **Fly.io**
- **Self-hosted VPS**

After deploying the server, update the WebSocket URL in `apps/web` to point to the production signaling server endpoint.

### Environment Variables

Create a `.env.local` file in `apps/web/` with the following (adjust values for your environment):

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

For production, set this to your deployed signaling server URL.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please make sure your code passes linting and type checks before submitting:

```bash
pnpm lint
pnpm check-types
```

---

## Acknowledgements

- [Turborepo](https://turborepo.dev) — monorepo build system
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) — the browser standard that makes P2P possible
- [Next.js](https://nextjs.org) — React framework for the frontend
- [Vercel](https://vercel.com) — hosting platform

---

<p align="center">Built with ❤️ by <a href="https://github.com/lazytech614">lazytech614</a></p>