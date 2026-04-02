import { z } from "zod";
import { badRequest, json } from "./utils";
import { FeedbackWorkflow } from "./workflow";
import type { ChatRequest, EndRequest } from "./types";

export { InterviewAgent } from "./agent";
export { FeedbackWorkflow } from "./workflow";

const chatSchema = z.object({
  sessionId: z.string().min(1),
  roleName: z.string().min(1),
  message: z.string().min(1),
});

const endSchema = z.object({
  sessionId: z.string().min(1),
});

async function getAgent(env: Env, sessionId: string) {
  const id = env.INTERVIEW_AGENT.idFromName(sessionId);
  return env.INTERVIEW_AGENT.get(id);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, app: "cf_ai_interview_copilot" });
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        const body = await request.json().catch(() => null);
        const parsed = chatSchema.safeParse(body);

        if (!parsed.success) {
          return badRequest("Invalid chat request");
        }

        const { sessionId, roleName, message } = parsed.data as ChatRequest;
        const agent = await getAgent(env, sessionId);

        const appendUserRes = await agent.fetch("https://agent/append-user", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roleName, message }),
        });

        if (!appendUserRes.ok) {
          return json(
            { error: "Failed to store user message" },
            { status: 500 }
          );
        }

        const stateRes = await agent.fetch("https://agent/messages", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roleName }),
        });

        if (!stateRes.ok) {
          return json(
            { error: "Failed to read conversation state" },
            { status: 500 }
          );
        }

        const stateData = await stateRes.json<{ messages: Array<{ role: string; content: string }> }>();
        const messages = stateData.messages;

        const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
            messages,
        });

        console.log("MESSAGES SENT TO AI:", JSON.stringify(messages, null, 2));
        console.log("RAW AI RESPONSE:", JSON.stringify(aiResponse, null, 2));

        let reply = "I could not generate a response right now.";

        if (aiResponse) {
        if (typeof aiResponse === "string") {
            reply = aiResponse;
        } else if ((aiResponse as any).response) {
            reply = (aiResponse as any).response;
        } else if ((aiResponse as any).result?.response) {
            reply = (aiResponse as any).result.response;
        } else if ((aiResponse as any).result?.text) {
            reply = (aiResponse as any).result.text;
        }
        }

        console.log("FINAL REPLY:", reply);

        const appendAssistantRes = await agent.fetch("https://agent/append-assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roleName, message: reply }),
        });

        if (!appendAssistantRes.ok) {
          return json(
            { error: "Failed to store assistant reply" },
            { status: 500 }
          );
        }

        return json({ reply });
      } catch (error) {
        console.error("CHAT API ERROR:", error);
        return json(
          {
            error: "Chat request failed",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    if (request.method === "POST" && url.pathname === "/api/end") {
      try {
        const body = await request.json().catch(() => null);
        const parsed = endSchema.safeParse(body);

        if (!parsed.success) {
          return badRequest("Invalid end request");
        }

        const { sessionId } = parsed.data as EndRequest;
        const agent = await getAgent(env, sessionId);

        const stateRes = await agent.fetch("https://agent/export", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ roleName: "Software Engineer" }),
        });

        if (!stateRes.ok) {
          return json(
            { error: "Failed to export interview state" },
            { status: 500 }
          );
        }

        const { state } = await stateRes.json<any>();

        const conversation = (state?.messages || [])
          .filter((m: any) => m.role !== "system")
          .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n\n");

        const workflow = new FeedbackWorkflow(env);
        const summary = await workflow.run(conversation);

        return json({ summary });
      } catch (error) {
        console.error("END API ERROR:", error);
        return json(
          {
            error: "End interview failed",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};

declare global {
  interface Env {
    AI: Ai;
    ASSETS: Fetcher;
    INTERVIEW_AGENT: DurableObjectNamespace;
    FEEDBACK_WORKFLOW: any;
  }
}