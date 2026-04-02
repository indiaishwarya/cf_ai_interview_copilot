# cf_ai_interview_copilot

An AI-powered interview practice application built on Cloudflare.

## Overview

Interview Copilot lets users practice technical or behavioral interviews through a real-time chat interface. The app remembers the ongoing conversation, asks context-aware follow-up questions, and can generate an end-of-session performance summary.

## Features

- Real-time AI chat interviewer
- Persistent session memory
- Role-based interview setup
- End-of-session feedback
- Built with Cloudflare-native AI and stateful primitives

## Tech Stack

- Cloudflare Workers
- Cloudflare Agents
- Cloudflare Durable Objects
- Cloudflare Workers AI
- Cloudflare Pages frontend
- TypeScript

## Architecture

- **Frontend**: Static Pages-style web app in `web/`
- **Worker API**: Handles chat requests and session orchestration
- **Agent**: Maintains interview session state
- **Workers AI**: Generates interviewer responses
- **Durable Object state**: Stores conversation memory
- **Workflow**: Generates end-of-session summary

## Why this project fits the assignment

This repository includes:
- an LLM integration
- workflow / coordination
- user input via chat
- memory / state

It also includes:
- a repo name prefixed with `cf_ai_`
- a `README.md`
- a `PROMPTS.md`

## Local setup

### Prerequisites

- Node.js 18+
- npm
- Wrangler CLI
- Cloudflare account

### Install

```bash
npm install
```

### Run locally
```bash
npm run dev
```

### Deploy
```bash
npm run deploy
```

### Project structure
src/
  index.ts        # Worker entrypoint and routes
  agent.ts        # Stateful interview agent
  prompts.ts      # System prompts and templates
  types.ts        # Shared types
  workflow.ts     # End-of-session feedback workflow
  utils.ts        # Helpers

web/
  index.html      # Chat UI
  styles.css      # Styling
  app.js          # Frontend logic

### Notes

This project is intentionally minimal so reviewers can run it quickly and inspect the important components easily.