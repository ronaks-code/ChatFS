# 🗂️ ChatFS — Cursor for Your File System

**ChatFS** is a native Mac app that lets you manage your folders and files through intelligent chat threads powered by LLMs. Think of it as **Cursor + Finder + GPT**, all in one modular, glassy desktop interface.

---

## ⚡ What It Does

- 💬 **Chat with your files and folders** — summarize, edit, query anything in your local system
- 🧠 **Per-folder memory** — each directory can have one or more saved chat threads (`.chat.md`, `.gpt.thread`, etc.)
- 🧩 **Modular chats** — move chats between folders, organize them like files
- 🔗 **Real file sync** — any file created in chat is reflected in your actual file system
- 🔄 **Multi-model support** — switch between GPT-4, Claude, Perplexity per thread

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| 💻 Frontend | React + Vite + Tailwind (for fast, beautiful UI) |
| 🔧 Backend | Rust (via Tauri) for file access + native APIs |
| 🧠 LLMs | OpenAI, Claude, Perplexity APIs |
| 🧳 Shell | Tauri (creates `.app` bundle, handles permissions and FS) |

---

## 📦 Dev Setup

```bash
git clone https://github.com/your-org/ChatFS.git
cd ChatFS

# Install dependencies
pnpm install

# Launch native app
pnpm tauri dev
