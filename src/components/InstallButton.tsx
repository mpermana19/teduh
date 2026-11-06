import { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export default function InstallButton() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || isInstalled || dismissed) return null;

  return (
    <div className="install-float">
      <button className="install-btn" onClick={install}>
        Pasang
      </button>
      <button
        className="install-close"
        onClick={() => setDismissed(true)}
        aria-label="Tutup"
      >
        ×
      </button>
    </div>
  );
}