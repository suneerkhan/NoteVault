const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, "db.json");

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── DB helpers ──────────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { notes: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Routes ──────────────────────────────────────────────────

// GET /api/notes  — list all (with optional ?search= and ?tag=)
app.get("/api/notes", (req, res) => {
  const { search, tag } = req.query;
  let { notes } = readDB();

  if (tag && tag === "__pinned__") {
    notes = notes.filter((n) => n.pinned === true);
  } else if (tag && tag !== "all") {
    notes = notes.filter((n) => n.tags && n.tags.includes(tag));
  }
  if (search) {
    const q = search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }

  // Pinned first, then by updatedAt desc
  notes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  res.json(notes);
});

// GET /api/notes/:id
app.get("/api/notes/:id", (req, res) => {
  const { notes } = readDB();
  const note = notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// POST /api/notes
app.post("/api/notes", (req, res) => {
  const { title, content, tags, color } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: "Title and content are required" });

  const db = readDB();
  const now = new Date().toISOString();
  const note = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    tags: tags || [],
    color: color || "#7C3AED",
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };

  db.notes.push(note);
  writeDB(db);
  res.status(201).json(note);
});

// PUT /api/notes/:id
app.put("/api/notes/:id", (req, res) => {
  const db = readDB();
  const idx = db.notes.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });

  const { title, content, tags, color, pinned } = req.body;
  db.notes[idx] = {
    ...db.notes[idx],
    ...(title !== undefined && { title: title.trim() }),
    ...(content !== undefined && { content: content.trim() }),
    ...(tags !== undefined && { tags }),
    ...(color !== undefined && { color }),
    ...(pinned !== undefined && { pinned }),
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json(db.notes[idx]);
});

// DELETE /api/notes/:id
app.delete("/api/notes/:id", (req, res) => {
  const db = readDB();
  const idx = db.notes.findIndex((n) => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Note not found" });

  db.notes.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

// GET /api/tags — all unique tags
app.get("/api/tags", (req, res) => {
  const { notes } = readDB();
  const tags = [...new Set(notes.flatMap((n) => n.tags || []))];
  res.json(tags);
});

// Health check
app.get("/", (req, res) => res.json({ status: "NoteVault API running 🚀" }));

app.listen(PORT, () => console.log(`NoteVault API running on port ${PORT}`));
