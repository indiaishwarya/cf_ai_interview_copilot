import { feedbackPrompt } from "./prompts";

export class FeedbackWorkflow {
  env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async run(conversation: string): Promise<string> {
    const response = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: [
        { role: "system", content: feedbackPrompt },
        { role: "user", content: conversation }
      ]
    });

    const text =
      (response as any)?.response ||
      (response as any)?.result?.response ||
      "Unable to generate feedback at this time.";

    return text;
  }
}