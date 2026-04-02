const chat = document.getElementById("chat");
const roleInput = document.getElementById("roleInput");
const messageInput = document.getElementById("messageInput");
const startBtn = document.getElementById("startBtn");
const sendBtn = document.getElementById("sendBtn");
const endBtn = document.getElementById("endBtn");

let sessionId = crypto.randomUUID();
let roleName = "";

function addMessage(text, who) {
  const div = document.createElement("div");
  div.className = `message ${who}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

startBtn.addEventListener("click", async () => {
  roleName = roleInput.value.trim();
  if (!roleName) {
    alert("Please enter a target role");
    return;
  }

  addMessage(`Interview session started for role: ${roleName}`, "assistant");

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      roleName,
      message: "Please begin the interview with your first question."
    })
  });

  const data = await res.json();
  addMessage(data.reply, "assistant");
});

sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (!message || !roleName) return;

  addMessage(message, "user");
  messageInput.value = "";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      sessionId,
      roleName,
      message
    })
  });

  const data = await res.json();
  addMessage(data.reply, "assistant");
});

endBtn.addEventListener("click", async () => {
  const res = await fetch("/api/end", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId })
  });

  const data = await res.json();
  addMessage("Interview summary:", "assistant");
  addMessage(data.summary, "assistant");
});