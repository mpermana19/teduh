import { useState, useEffect } from "react";
import PinScreen from "./components/PinScreen";
import ChatScreen from "./components/ChatScreen";
import InstallButton from "./components/InstallButton";

type Stage = "mp" | "teks" | "teduh" | "pin" | "chat";

export default function App() {
  const [stage, setStage] = useState<Stage>("mp");
  const [demo, setDemo] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const go = (next: Stage, delay: number) => {
      const t = setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setStage(next);
          setFading(false);
        }, 400);
      }, delay);
      return () => clearTimeout(t);
    };

    if (stage === "mp") return go("teks", 2400);
    if (stage === "teks") return go("teduh", 4200);
    if (stage === "teduh") return go("pin", 2800);
  }, [stage]);

  return (
    <>
      {stage === "mp" && (
        <div className="app">
          <div className="scene">
            <img className="mp-logo" src="/mp-karya.png" alt="MP Karya" />
          </div>
        </div>
      )}

      {stage === "teks" && (
        <div className="app">
          <div className={`scene ${fading ? "fade-out" : ""}`}>
            <div className="lines">
              <p>Gak perlu siap.</p>
              <p>Gak perlu rapi.</p>
              <p>Cukup datang.</p>
            </div>
          </div>
        </div>
      )}

      {stage === "teduh" && (
        <div className="app">
          <div className={`scene ${fading ? "fade-out" : ""}`}>
            <img className="teduh-logo" src="/teduh.png" alt="Teduh" />
          </div>
        </div>
      )}

      {stage === "pin" && (
        <div className="app page-enter">
          <PinScreen
            onUnlock={() => setStage("chat")}
            onDemo={() => { setDemo(true); setStage("chat"); }}
          />
        </div>
      )}

      {stage === "chat" && (
        <ChatScreen
          demo={demo}
          onExit={() => { setDemo(false); setStage("pin"); }}
          onLock={() => setStage("pin")}
        />
      )}

      <InstallButton />
    </>
  );
}