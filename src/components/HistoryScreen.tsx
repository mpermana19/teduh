import { useState } from "react";
import { getAllSessions, deleteSession } from "../utils/storage";
import type { Session } from "../utils/storage";
import { ChevronLeft, ChevronRight } from "./icons";

type Props = { onBack: () => void };

function Bubbles() {
  return (
    <div className="bubbles" aria-hidden>
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
      <span className="bubble-float" />
    </div>
  );
}

function pickMood(text: string): string {
  const t = text.toLowerCase();
  if (/(sedih|nangis|kecewa|hancur|sepi|sendiri)/.test(t)) return "🌧";
  if (/(capek|lelah|berat|penat|letih)/.test(t)) return "🕯";
  if (/(bingung|gak tau|entah|ragu)/.test(t)) return "🌫";
  if (/(senang|bahagia|lega|syukur|bangga|cerah)/.test(t)) return "🌤";
  if (/(takut|cemas|khawatir|gelisah)/.test(t)) return "🌑";
  return "🌱";
}

function pickTitle(text: string): string {
  const firstLine = text.split(/[.!?\n]/).map((s) => s.trim()).find(Boolean);
  if (!firstLine) return "Catatan";
  return firstLine.length > 42 ? firstLine.slice(0, 42) + "…" : firstLine;
}

export default function HistoryScreen({ onBack }: Props) {
  const [sessions, setSessions] = useState<Session[]>(getAllSessions());
  const [open, setOpen] = useState<Session | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const handleDelete = (id: number) => {
    if (!confirm("Yakin hapus catatan ini?")) return;
    deleteSession(id);
    setSessions(getAllSessions());
    setOpen(null);
  };

  const openDetail = (s: Session) => {
    setOpen(s);
    setShowTranscript(false);
  };

  if (open) {
    return (
      <div className="app page-enter">
        <Bubbles />
        <header className="app-header">
          <div className="header-left">
            <button
              className="icon-btn"
              onClick={() => setOpen(null)}
              aria-label="Kembali"
            >
              <ChevronLeft />
            </button>
          </div>
          <div className="header-center">
            <strong>Catatan</strong>
          </div>
          <div className="header-right" />
        </header>

        <div className="detail-body">
          <h3 className="detail-date">
            {new Date(open.date).toLocaleString("id-ID", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </h3>

          <div className="detail-summary">{open.summary}</div>

          <button
            className="row-btn"
            onClick={() => setShowTranscript((v) => !v)}
          >
            <span>{showTranscript ? "Sembunyikan obrolan" : "Lihat obrolan"}</span>
            <span
              className="row-chevron"
              style={{
                transform: showTranscript ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <ChevronRight />
            </span>
          </button>

          {showTranscript && (
            <div className="detail-transcript">
              {open.transcript.map((m, i) => (
                <div
                  key={i}
                  className={`bubble ${m.role === "user" ? "user" : "ai"}`}
                >
                  {m.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-footer">
          <button
            className="btn"
            style={{ background: "#c0392b" }}
            onClick={() => handleDelete(open.id)}
          >
            Hapus Catatan
          </button>
        </div>
      </div>
    );
  }

  const grouped = sessions.reduce<Record<string, Session[]>>((acc, s) => {
    const key = new Date(s.date).toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });
    (acc[key] = acc[key] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="app page-enter">
      <Bubbles />
      <header className="app-header">
        <div className="header-left">
          <button className="icon-btn" onClick={onBack} aria-label="Kembali">
            <ChevronLeft />
          </button>
        </div>
        <div className="header-center">
          <strong>Riwayat</strong>
        </div>
        <div className="header-right" />
      </header>

      <div className="history-list">
        {sessions.length === 0 && (
          <div className="empty-state">
            <p>Belum ada catatan di sini.</p>
            <p className="empty-sub">Mulai dari satu hal kecil. Gak harus rapi.</p>
          </div>
        )}
        {Object.entries(grouped).map(([month, items]) => (
          <div key={month}>
            <div className="month-title">{month}</div>
            {items.map((s) => (
              <div key={s.id} className="card" onClick={() => openDetail(s)}>
                <div className="card-top">
                  <small>
                    {new Date(s.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </small>
                  <span className="card-mood" aria-hidden>
                    {pickMood(s.summary)}
                  </span>
                </div>
                <div className="card-title">{pickTitle(s.summary)}</div>
                <div className="preview">{s.summary}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}