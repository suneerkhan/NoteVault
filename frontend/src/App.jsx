import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from './api';
import { timeAgo, ACCENT_COLORS, getTagColor } from './utils';
import './App.css';

const PRESET_TAGS = ['Work', 'Personal', 'Ideas', 'Study', 'Finance', 'Health', 'Travel', 'Other'];

// ── NoteCard ────────────────────────────────────────────────
function NoteCard({ note, onSelect, onDelete, onPin, selected, deleting }) {
  return (
    <div
      className={`note-card ${selected ? 'selected' : ''} ${deleting ? 'deleting' : ''}`}
      style={{ '--accent': note.color, animationDelay: `${(note._idx || 0) * 0.06}s` }}
      onClick={() => onSelect(note)}
    >
      <div className="card-accent-bar" />
      <div className="card-inner">
        <div className="card-header">
          <h3 className="card-title">{note.title}</h3>
          <div className="card-actions">
            <button
              className={`icon-btn pin-btn ${note.pinned ? 'pinned' : ''}`}
              onClick={(e) => { e.stopPropagation(); onPin(note); }}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              📌
            </button>
            <button
              className="icon-btn del-btn"
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              title="Delete"
            >
              🗑
            </button>
          </div>
        </div>

        <p className="card-preview">{note.content}</p>

        <div className="card-footer">
          <div className="tag-row">
            {note.tags && note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag" style={{ '--tc': getTagColor(tag) }}>{tag}</span>
            ))}
            {(!note.tags || note.tags.length === 0) && (
              <span className="tag" style={{ '--tc': 'var(--text-dim)', opacity: 0.5 }}>+ tag</span>
            )}
          </div>
          <div className="card-meta-chips">
            <span className="meta-chip">
              <span className="meta-chip-icon">🕐</span>
              {timeAgo(note.updatedAt)}
            </span>
            <span className="meta-chip">
              <span className="meta-chip-icon">📝</span>
              {(() => {
                const words = note.content.trim().split(/\s+/).filter(Boolean).length;
                const chars = note.content.length;
                return words <= 3 ? `${chars} chars` : `${words} words`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NoteModal (create / edit) ────────────────────────────────
function NoteModal({ note, onSave, onClose }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [color, setColor] = useState(note?.color || ACCENT_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef();

  useEffect(() => { titleRef.current?.focus(); }, []);

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setSaving(true);
    try {
      await onSave({ title, content, tags, color });
      onClose();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" style={{ '--accent': color }}>
        <div className="modal-accent-bar" />
        <div className="modal-header">
          <h2>{note ? '✏️ Edit Note' : '✨ New Note'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <input
          ref={titleRef}
          className="modal-input"
          placeholder="Note title…"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          maxLength={100}
        />

        <div className="char-info">{title.length}/100</div>

        <textarea
          className="modal-textarea"
          placeholder="Start writing your note…"
          value={content}
          onChange={e => { setContent(e.target.value); setError(''); }}
          rows={8}
        />

        <div className="char-info">{content.length} chars</div>

        <div className="modal-section-label">Tags</div>
        <div className="tag-picker">
          {PRESET_TAGS.map(t => (
            <button
              key={t}
              className={`tag-option ${tags.includes(t) ? 'active' : ''}`}
              style={{ '--tc': getTagColor(t) }}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="modal-section-label">Accent Color</div>
        <div className="color-picker">
          {ACCENT_COLORS.map(c => (
            <button
              key={c}
              className={`color-dot ${color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : note ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ViewPanel ────────────────────────────────────────────────
function ViewPanel({ note, onEdit, onClose }) {
  if (!note) return (
    <div className="view-panel empty-panel">
      <div className="empty-icon">📖</div>
      <p>Select a note to read it</p>
    </div>
  );

  return (
    <div className="view-panel" style={{ '--accent': note.color }}>
      <div className="view-accent-bar" />
      <div className="view-inner">
        <div className="view-header">
          <div>
            <div className="view-time">Last edited {timeAgo(note.updatedAt)}</div>
            <h2 className="view-title">{note.title}</h2>
          </div>
          <div className="view-actions">
            <button className="btn-ghost-sm" onClick={onEdit}>✏️ Edit</button>
            <button className="icon-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="tag-row" style={{ marginBottom: '1.5rem' }}>
          {note.tags && note.tags.map(tag => (
            <span key={tag} className="tag" style={{ '--tc': getTagColor(tag) }}>{tag}</span>
          ))}
        </div>
        <div className="view-content">{note.content}</div>
        <div className="view-meta">
          <span>Created {new Date(note.createdAt).toLocaleString()}</span>
          <span>⏱ {Math.max(1, Math.ceil(note.content.split(/\s+/).length / 200))} min read · {note.content.length} chars</span>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]); // unfiltered, for counts
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [allTags, setAllTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [modal, setModal] = useState(null); // null | 'create' | note-object
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      const [filtered, all] = await Promise.all([
        api.getNotes(search, activeTag),
        api.getNotes('', 'all'),
      ]);
      setNotes(filtered);
      setAllNotes(all);
    } catch {
      showToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, activeTag, showToast]);

  const loadTags = useCallback(async () => {
    try {
      const data = await api.getTags();
      setAllTags(data);
    } catch {}
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);
  useEffect(() => { loadTags(); }, [loadTags]);

  async function handleSave(data) {
    if (modal && modal !== 'create') {
      await api.updateNote(modal.id, data);
      showToast('Note updated ✨');
    } else {
      await api.createNote(data);
      showToast('Note created 🚀');
    }
    loadNotes();
    loadTags();
    setSelectedNote(null);
  }

  async function handleDelete(id) {
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await api.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNote?.id === id) setSelectedNote(null);
        showToast('Note deleted');
        loadTags();
      } catch {
        showToast('Delete failed', 'error');
      }
      setDeletingId(null);
    }, 350);
  }

  async function handlePin(note) {
    try {
      await api.updateNote(note.id, { pinned: !note.pinned });
      loadNotes();
      if (selectedNote?.id === note.id) {
        setSelectedNote(prev => ({ ...prev, pinned: !prev.pinned }));
      }
      showToast(note.pinned ? 'Unpinned' : 'Pinned 📌');
    } catch {
      showToast('Failed', 'error');
    }
  }

  const pinnedNotes = notes.filter(n => n.pinned);
  const regularNotes = notes.filter(n => !n.pinned);

  // counts always from full dataset
  const totalCount = allNotes.length;
  const pinnedCount = allNotes.filter(n => n.pinned).length;
  const tagCount = allTags.length;

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🗒</span>
          <span className="logo-text">NoteVault</span>
        </div>

        <button className="btn-primary new-btn" onClick={() => { setModal('create'); setSidebarOpen(false); }}>
          <span>+</span> New Note
        </button>

        <nav className="sidebar-nav">
          <div className="nav-label">Filter</div>
          <button
            className={`nav-item ${activeTag === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveTag('all'); setSidebarOpen(false); }}
          >
            📋 All Notes
            <span className="nav-count">{totalCount}</span>
          </button>
          <button
            className={`nav-item ${activeTag === '__pinned__' ? 'active' : ''}`}
            onClick={() => { setActiveTag('__pinned__'); setSidebarOpen(false); }}
          >
            📌 Pinned
            <span className="nav-count">{pinnedCount}</span>
          </button>

          {allTags.length > 0 && (
            <>
              <div className="nav-label" style={{ marginTop: '1rem' }}>Tags</div>
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`nav-item ${activeTag === tag ? 'active' : ''}`}
                  onClick={() => { setActiveTag(tag); setSidebarOpen(false); }}
                >
                  <span className="tag-dot" style={{ background: getTagColor(tag) }} />
                  {tag}
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <span>{totalCount} note{totalCount !== 1 ? 's' : ''}</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        {/* Header */}
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <button className="btn-primary topbar-new" onClick={() => setModal('create')}>
            + New
          </button>
        </header>

        {/* Stats strip */}
        <div className="stats-strip">
          <div className="stat-pill">
            <span className="stat-icon">📄</span>
            <span className="stat-val">{totalCount}</span>
            <span className="stat-label">Notes</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-pill">
            <span className="stat-icon">📌</span>
            <span className="stat-val">{pinnedCount}</span>
            <span className="stat-label">Pinned</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-pill">
            <span className="stat-icon">🏷️</span>
            <span className="stat-val">{tagCount}</span>
            <span className="stat-label">Tags</span>
          </div>
        </div>
        <div className="content-area">
          <div className={`notes-section ${selectedNote ? 'with-panel' : ''}`}>
            {loading ? (
              <div className="grid">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="skeleton" style={{ height: 180, animationDelay: `${i*0.1}s` }} />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-big">🌌</div>
                <h3>No notes yet</h3>
                <p>Create your first note to get started</p>
                <button className="btn-primary" onClick={() => setModal('create')}>+ Create Note</button>
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && activeTag !== '__pinned__' && (
                  <>
                    <div className="section-label">📌 Pinned</div>
                    <div className="grid">
                      {pinnedNotes.map((note, i) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          selected={selectedNote?.id === note.id}
                          deleting={deletingId === note.id}
                          onSelect={setSelectedNote}
                          onDelete={handleDelete}
                          onPin={handlePin}
                          style={{ animationDelay: `${i * 0.06}s` }}
                        />
                      ))}
                    </div>
                    {regularNotes.length > 0 && <div className="section-label" style={{marginTop:'1.5rem'}}>All Notes</div>}
                  </>
                )}
                <div className="grid">
                  {(activeTag === '__pinned__' ? pinnedNotes : regularNotes).map((note, i) => (
                    <NoteCard
                      key={note.id}
                      note={{ ...note, _idx: i }}
                      selected={selectedNote?.id === note.id}
                      deleting={deletingId === note.id}
                      onSelect={setSelectedNote}
                      onDelete={handleDelete}
                      onPin={handlePin}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View Panel */}
          {selectedNote && (
            <ViewPanel
              note={selectedNote}
              onEdit={() => setModal(selectedNote)}
              onClose={() => setSelectedNote(null)}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <NoteModal
          note={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}
    </div>
  );
}
