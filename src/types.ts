export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type InterviewState = {
  roleName: string;
  messages: ChatMessage[];
  startedAt: string;
};

export type ChatRequest = {
  sessionId: string;
  roleName: string;
  message: string;
};

export type EndRequest = {
  sessionId: string;
};