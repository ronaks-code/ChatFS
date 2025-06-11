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

🔐 Make sure you have Rust and Tauri CLI installed globally

⸻

🌱 Folder Structure
ChatFS/
├── frontend/           # React + Tailwind app UI
│   ├── src/
│   └── public/
├── src-tauri/          # Rust + Tauri backend
│   ├── src/
│   │   ├── main.rs
│   │   └── commands.rs
│   ├── tauri.conf.json
│   └── Cargo.toml
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml
├── README.md

🚧 Roadmap
	•	Folder-scoped chats stored as .chat.md or .gpt.thread
	•	Create/delete/query files via chat
	•	Model dropdown with GPT-4, Claude, Perplexity
	•	@-mention files and folders
	•	Project-wide memory (summaries, embeddings)
	•	Intelligent model routing (based on intent)
	•	Vector search across your file system (stretch)

⸻

🙋‍♂️ Team

Built fast, clean, and hacker-style by:
	•	Ronak – frontend + product flow
	•	Taimur – UI + interaction systems
	•	Varoon – Rust, Tauri, and backend integrations
	•	Sohum – ghosted (MIA, vibes only)

⸻

🧠 Why ChatFS?

Current tools treat your file system like a dumb pile of folders. ChatFS makes it chat-native — giving every folder memory, every file a voice, and every project persistent LLM context. It’s the first OS layer where chat threads are modular, local, and real.

⸻

📄 License

MIT License — feel free to build, fork, remix.

Want me to generate a `LICENSE` file or favicon/logo next?
