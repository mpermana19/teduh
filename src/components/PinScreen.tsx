import { useState } from "react";
import {
  getPin,
  setPin as savePin,
  importData,
} from "../utils/storage";

const PIN_LENGTH = 6;

type Props = {
  onUnlock: () => void;
  onDemo: () => void;
};

export default function PinScreen({ onUnlock, onDemo }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [visible, setVisible] = useState(false);
  const [visibleNew, setVisibleNew] = useState(false);
  const savedPin = getPin();

  const isComplete = pin.length === PIN_LENGTH;
  const isNewComplete = newPin.length === PIN_LENGTH;

  const handleSubmit = () => {
    if (!isComplete) return;
    if (!savedPin) {
      savePin(pin);
      onUnlock();
    } else if (pin === savedPin) {
      onUnlock();
    } else {
      setError("PIN salah");
      setPin("");
    }
  };

  const handleReset = () => {
    if (!isNewComplete) return;
    savePin(newPin);
    setNewPin("");
    setShowReset(false);
    setInfo("PIN baru dibuat. Silakan import cadangan jika ada.");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(file)
      .then((count) => setInfo(`${count} sesi berhasil dipulihkan.`))
      .catch(() => setError("Gagal mengimpor file."));
    e.target.value = "";
  };

  const holdHandlers = (setter: (v: boolean) => void) => ({
    onMouseDown: () => setter(true),
    onMouseUp: () => setter(false),
    onMouseLeave: () => setter(false),
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      setter(true);
    },
    onTouchEnd: () => setter(false),
    onTouchCancel: () => setter(false),
  });

  if (showReset) {
    return (
      <div className="pin-screen">
        <div className="pin-hero">
          <img src="/teduh.png" alt="Teduh" />
          <h2>PIN baru</h2>
          <p>Buat 6 digit PIN baru. Cerita lama bisa diimport setelahnya.</p>
        </div>

        <div className="pin-form">
          <div className="pin-wrap">
            <input
              className={`pin-input ${newPin ? "filled" : ""}`}
              type={visibleNew ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={PIN_LENGTH}
              value={newPin}
              onChange={(e) =>
                setNewPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && isNewComplete) handleReset();
              }}
              placeholder="••••••"
              autoFocus
            />
            <button
              type="button"
              className="pin-eye"
              {...holdHandlers(setVisibleNew)}
              aria-label="Tahan untuk lihat PIN"
            >
              👁
            </button>
          </div>

          {error && <small className="pin-error">{error}</small>}

          <button className="btn" onClick={handleReset} disabled={!isNewComplete}>
            Simpan PIN baru
          </button>
          <button className="btn-link" onClick={() => setShowReset(false)}>
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pin-screen">
      <div className="pin-hero">
        <img src="/teduh.png" alt="Teduh" />
        <h2>{savedPin ? "Selamat datang kembali" : "Buat PIN kamu"}</h2>
        <p>
          {savedPin
            ? "Masukkan 6 digit PIN untuk masuk."
            : "Ruang tenang buat ceritamu. PIN ini kunci satu-satunya."}
        </p>
      </div>

      <div className="pin-form">
        <div className="pin-wrap">
          <input
            className={`pin-input ${pin ? "filled" : ""}`}
            type={visible ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={PIN_LENGTH}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH));
              setError("");
              setInfo("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isComplete) handleSubmit();
            }}
            placeholder="••••••"
            autoFocus
          />
          <button
            type="button"
            className="pin-eye"
            {...holdHandlers(setVisible)}
            aria-label="Tahan untuk lihat PIN"
          >
            👁
          </button>
        </div>

        {error && <small className="pin-error">{error}</small>}
        {info && <small className="pin-info">{info}</small>}

        <button className="btn" onClick={handleSubmit} disabled={!isComplete}>
          {savedPin ? "Masuk" : "Simpan PIN"}
        </button>
      </div>

      <div className="pin-extras">
        {savedPin && (
          <button
            className="btn-link"
            onClick={() => { setShowReset(true); setError(""); setInfo(""); }}
          >
            Lupa PIN?
          </button>
        )}

        <label className="btn-link" style={{ cursor: "pointer" }}>
          Import cadangan
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>

        <button className="btn-demo" onClick={onDemo}>
          Lihat contoh
        </button>
      </div>
    </div>
  );
}