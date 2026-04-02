import type { InterviewState } from "./types";
import { buildSystemPrompt } from "./prompts";

export class InterviewAgent {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async getInterviewState(roleName: string): Promise<InterviewState> {
    const stored = await this.state.storage.get<InterviewState>("interview_state");
    if (stored) return stored;

    const initial: InterviewState = {
      roleName,
      startedAt: new Date().toISOString(),
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(roleName),
        },
      ],
    };

    await this.state.storage.put("interview_state", initial);
    return initial;
  }

  async saveInterviewState(next: InterviewState): Promise<void> {
    await this.state.storage.put("interview_state", next);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({} as any));
    const roleName = body.roleName || "Software Engineer";
    const message = body.message || "";

    if (url.pathname === "/append-user") {
      const current = await this.getInterviewState(roleName);
      current.messages.push({ role: "user", content: message });
      await this.saveInterviewState(current);
      return Response.json({ ok: true });
    }

    if (url.pathname === "/append-assistant") {
      const current = await this.getInterviewState(roleName);
      current.messages.push({ role: "assistant", content: message });
      await this.saveInterviewState(current);
      return Response.json({ ok: true });
    }

    if (url.pathname === "/messages") {
      const current = await this.getInterviewState(roleName);
      return Response.json({ messages: current.messages });
    }

    if (url.pathname === "/export") {
      const current = await this.getInterviewState(roleName);
      return Response.json({ state: current });
    }

    return new Response("Not Found", { status: 404 });
  }
}

declare global {
  interface Env {
    AI: Ai;
    INTERVIEW_AGENT: DurableObjectNamespace;
  }
}