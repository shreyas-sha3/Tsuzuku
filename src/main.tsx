import React from "react";
import ReactDOM from "react-dom/client";
import { Touch } from "./Touch";

import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Touch />
    <App />
  </React.StrictMode>
);
