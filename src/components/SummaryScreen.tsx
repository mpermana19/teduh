import { useEffect, useRef } from "react";

type Props = {
  summary: string;
  onChange: (val: string) => void;
  onDone: () => void;
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

export default function SummaryScreen({ summary, onChange, onDone }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoGrow();
  }, [summary]);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="app page-enter">
      <Bubbles />
      <header className="app-header">
        <div className="header-left" />
        <div className="header-center">
          <strong>Catatan hari ini</strong>
          <small>{today}</small>
        </div>
        <div className="header-right" />
      </header>

      <div className="journal-body">
        <textarea
          ref={textareaRef}
          className="journal-text"
          value={summary}
          onChange={(e) => {
            onChange(e.target.value);
            requestAnimationFrame(autoGrow);
          }}
          spellCheck={false}
        />
      </div>

      <div className="summary-footer">
        <button className="btn" onClick={onDone}>Selesai</button>
      </div>
    </div>
  );
}