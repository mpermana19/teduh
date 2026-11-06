import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const bubbles = document.getElementById("bubbles");
if (bubbles && bubbles.childElementCount === 0) {
  for (let i = 0; i < 9; i++) {
    bubbles.appendChild(document.createElement("span"));
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);