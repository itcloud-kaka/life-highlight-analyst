const messagesElement = document.querySelector("#messages");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const starters = document.querySelector("#starters");
const errorBanner = document.querySelector("#error-banner");
const serviceStatus = document.querySelector("#service-status");
const statusDot = document.querySelector(".status-dot");
const newChatButton = document.querySelector("#new-chat");

const conversation = [];
let isSending = false;

function scrollToBottom() {
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function currentTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function appendInline(container, text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  parts.forEach((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = part.slice(2, -2);
      container.append(strong);
    } else {
      container.append(document.createTextNode(part));
    }
  });
}

function renderMarkdown(text) {
  const fragment = document.createDocumentFragment();
  const lines = text.split(/\r?\n/);
  let list = null;

  const closeList = () => {
    if (list) {
      fragment.append(list);
      list = null;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      return;
    }

    const heading = line.match(/^#{2,4}\s+(.+)$/);
    if (heading) {
      closeList();
      const element = document.createElement("h3");
      appendInline(element, heading[1]);
      fragment.append(element);
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || ordered) {
      const tag = ordered ? "ol" : "ul";
      if (!list || list.tagName.toLowerCase() !== tag) {
        closeList();
        list = document.createElement(tag);
      }
      const item = document.createElement("li");
      appendInline(item, (bullet || ordered)[1]);
      list.append(item);
      return;
    }

    closeList();
    const paragraph = document.createElement("p");
    appendInline(paragraph, line);
    fragment.append(paragraph);
  });

  closeList();
  return fragment;
}

function addMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "光";
    article.append(avatar);
  }

  const content = document.createElement("div");
  content.className = "message-content";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "assistant") {
    bubble.append(renderMarkdown(text));
  } else {
    bubble.textContent = text;
  }
  const time = document.createElement("time");
  time.textContent = currentTime();
  content.append(bubble, time);
  article.append(content);
  messagesElement.append(article);
  scrollToBottom();
}

function showTyping() {
  const article = document.createElement("article");
  article.id = "typing";
  article.className = "message assistant-message";
  article.innerHTML = `
    <div class="message-avatar" aria-hidden="true">光</div>
    <div class="message-content">
      <div class="bubble typing-bubble" aria-label="正在思考">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  messagesElement.append(article);
  scrollToBottom();
}

function hideTyping() {
  document.querySelector("#typing")?.remove();
}

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.hidden = true;
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

async function sendMessage(text) {
  const cleanText = text.trim();
  if (!cleanText || isSending) return;

  hideError();
  starters?.remove();
  addMessage("user", cleanText);
  conversation.push({ role: "user", content: cleanText });
  input.value = "";
  resizeInput();
  isSending = true;
  sendButton.disabled = true;
  showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "暂时无法完成分析，请稍后再试。");
    hideTyping();
    addMessage("assistant", data.text);
    conversation.push({ role: "assistant", content: data.text });
  } catch (error) {
    hideTyping();
    showError(error.message);
  } finally {
    isSending = false;
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", resizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll(".starter").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    resizeInput();
    input.focus();
  });
});

newChatButton.addEventListener("click", () => {
  window.location.reload();
});

fetch("/api/health")
  .then((response) => response.json())
  .then((data) => {
    if (data.configured) {
      serviceStatus.textContent = "在线，愿意认真听你说";
    } else {
      serviceStatus.textContent = "等待管理员配置服务";
      statusDot.classList.add("offline");
    }
  })
  .catch(() => {
    serviceStatus.textContent = "连接暂时不稳定";
    statusDot.classList.add("offline");
  });
