import { useState } from "react";
import { getPin, setPin, exportData, importData } from "../utils/storage";
import { ChevronLeft, ChevronRight } from "./icons";

type Props = {
  onBack: () => void;
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

export default function SettingsScreen({ onBack }: Props) {
  const [mode, setMode] = useState<"menu" | "ganti">("menu");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleChangePin = () => {
    setError("");
    setInfo("");
    if (oldPin !== getPin()) return setError("PIN lama salah");
    if (newPin.length !== 6) return setError("PIN baru harus 6 digit");
    if (newPin !== confirmPin) return setError("Konfirmasi tidak cocok");
    setPin(newPin);
    setOldPin("");
    setNewPin("");
    setConfirmPin("");
    setInfo("PIN berhasil diganti.");
    setMode("menu");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(file)
      .then((count) => setInfo(`${count} sesi berhasil diimpor.`))
      .catch(() => setError("Gagal mengimpor file."));
    e.target.value = "";
  };

  return (
    <div className="app page-enter">
      <Bubbles />
      <header className="app-header">
        <div className="header-left">
          <button
            className="icon-btn"
            onClick={() => (mode === "ganti" ? setMode("menu") : onBack())}
            aria-label="Kembali"
          >
            <ChevronLeft />
          </button>
        </div>
        <div className="header-center">
          <strong>{mode === "ganti" ? "Ganti PIN" : "Pengaturan"}</strong>
        </div>
        <div className="header-right" />
      </header>

      <div className="detail-body">
        {mode === "menu" && (
          <>
            <button className="row-btn" onClick={() => setMode("ganti")}>
              <span>Ganti PIN</span>
              <span className="row-chevron">
                <ChevronRight />
              </span>
            </button>

            <button className="row-btn" onClick={exportData}>
              <span>Export data</span>
              <span className="row-chevron">
                <ChevronRight />
              </span>
            </button>

            <label className="row-btn" style={{ cursor: "pointer" }}>
              <span>Import data</span>
              <span className="row-chevron">
                <ChevronRight />
              </span>
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </label>

            {info && <small className="pin-info">{info}</small>}
            {error && <small className="pin-error">{error}</small>}
          </>
        )}

        {mode === "ganti" && (
          <>
            <input
              className={`pin-input ${oldPin ? "filled" : ""}`}
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN lama"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className={`pin-input ${newPin ? "filled" : ""}`}
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN baru"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className={`pin-input ${confirmPin ? "filled" : ""}`}
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Ulangi PIN baru"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            />
            {error && <small className="pin-error">{error}</small>}
            <button className="btn" onClick={handleChangePin}>
              Simpan PIN baru
            </button>
          </>
        )}
      </div>
    </div>
  );
}