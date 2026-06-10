import { createRoot } from "react-dom/client";
import App from "./App";
import { configureApiClient } from "./lib/api-config";
import "./index.css";

// Configure API client before rendering app
configureApiClient();

createRoot(document.getElementById("root")!).render(<App />);
