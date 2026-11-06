export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Session = {
  id: number;
  date: string;
  summary: string;
  transcript: Message[];
};

const SESSIONS_KEY = "teduh_sessions";
const PIN_KEY = "teduh_pin";

export const getAllSessions = (): Session[] => {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveSession = (session: Session): void => {
  const all = getAllSessions();
  all.unshift(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
};

export const deleteSession = (id: number): void => {
  const all = getAllSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
};

export const getPin = (): string | null => localStorage.getItem(PIN_KEY);
export const setPin = (pin: string): void => localStorage.setItem(PIN_KEY, pin);

export const isFirstLaunch = (): boolean => !getPin();

export const exportData = (): void => {
  const blob = new Blob([JSON.stringify(getAllSessions(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `teduh-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!Array.isArray(data)) throw new Error("Format tidak valid");
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
        resolve(data.length);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal baca file"));
    reader.readAsText(file);
  });
};