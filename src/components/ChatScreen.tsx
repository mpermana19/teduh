import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../utils/ai";
import { saveSession } from "../utils/storage";
import type { Message } from "../utils/storage";
import SummaryScreen from "./SummaryScreen";
import HistoryScreen from "./HistoryScreen";
import SettingsScreen from "./SettingsScreen";
import { LockIcon, GearIcon, ListIcon } from "./icons";

const OPENING: Message = {
  role: "assistant",
  content:
    "Hai. Aku Teduh.\nAku gak tau apa yang lagi kamu rasain. Tapi aku mau dengerin.",
};

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

type Props = {
  demo?: boolean;
  onExit?: () => void;
  onLock?: () => void;
};

export default function ChatScreen({ demo = false, onExit, onLock }: Props) {
  const [messages, setMessages] = useState<Message[]>([OPENING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    setLoading(true);

    try {
      const reply = await sendMessage(newMessages);
      setLoading(false);
      setTimeout(() => {
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      }, 150);
    } catch {
      setLoading(false);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Teduh diam sejenak. Coba lagi ya." },
      ]);
    }
  };

  const handleEnd = async () => {
    setLoading(true);
    const summaryPrompt: Message[] = [
      ...messages,
      {
        role: "user",
        content:
          "Tulis catatan jurnal dari sudut pandang orang pertama (pakai 'aku').\n\n" +
          "ATURAN KETAT:\n" +
          "- HANYA pakai peristiwa, kata, dan perasaan yang benar-benar disebutkan penulis di obrolan ini.\n" +
          "- JANGAN menambahkan detail yang tidak disebut: tempat, benda, nama, angka, atau kejadian lain.\n" +
          "- JANGAN menceritakan percakapan. Jangan menyebut Teduh.\n" +
          "- JANGAN menutup dengan kalimat motivasi.\n" +
          "- JANGAN memakai kata seperti 'momentum', 'ide-ide kreatif'.\n" +
          "- Kalau obrolan sedikit, tulis satu kalimat saja.\n" +
          "- Tanpa label, tanpa poin, tanpa judul.\n" +
          "- Bahasa Indonesia santai, seperti diary.",
      },
    ];

    try {
      const reply = await sendMessage(summaryPrompt);
      setSummary(reply);
      if (!demo) {
        saveSession({
          id: Date.now(),
          date: new Date().toISOString(),
          summary: reply,
          transcript: messages,
        });
      }
    } catch {
      setSummary("Gagal membuat catatan.");
    } finally {
      setLoading(false);
    }
  };

  if (showHistory) return <HistoryScreen onBack={() => setShowHistory(false)} />;
  if (showSettings) return <SettingsScreen onBack={() => setShowSettings(false)} />;

  if (summary) {
    return (
      <SummaryScreen
        summary={summary}
        onChange={setSummary}
        onDone={() => {
          setSummary(null);
          setMessages([OPENING]);
        }}
      />
    );
  }

  return (
    <div className="app page-enter">
      <Bubbles />
      <header className="app-header">
        <div className="header-left">
          {demo && onExit ? (
            <button className="icon-btn" onClick={onExit} aria-label="Keluar">
              <LockIcon />
            </button>
          ) : (
            <div className="header-logo">
              <img src="/teduh.png" alt="Teduh" />
            </div>
          )}
        </div>

        <div className="header-center">
          <strong>Teduh</strong>
          {demo && <small>demo</small>}
        </div>

        <div className="header-right">
          {!demo && (
            <>
              <button
                className="icon-btn"
                onClick={() => setShowSettings(true)}
                aria-label="Pengaturan"
              >
                <GearIcon />
              </button>
              <button
                className="icon-btn"
                onClick={() => setShowHistory(true)}
                aria-label="Riwayat"
              >
                <ListIcon />
              </button>
              {onLock && (
                <button
                  className="icon-btn"
                  onClick={onLock}
                  aria-label="Kunci"
                >
                  <LockIcon />
                </button>
              )}
            </>
          )}
          <button
            className="btn small"
            onClick={handleEnd}
            disabled={messages.length < 2 || loading}
          >
            Akhiri
          </button>
        </div>
      </header>

      <div className="chat-list" ref={listRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bubble ai typing" key="typing">
            Teduh mengetik…
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          ref={textareaRef}
          autoFocus
          value={input}
          placeholder="Cerita apa saja…"
          onChange={(e) => {
            setInput(e.target.value);
            resizeTextarea();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="btn small" onClick={handleSend} disabled={loading}>
          Kirim
        </button>
      </div>
    </div>
  );
}