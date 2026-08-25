import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./App";

import "./styles/globals.css";
import "./styles/theme.css";

import { AuthProvider } from "./modules/auth/contexts/AuthContexts";

const queryClient = new QueryClient();

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>

    <QueryClientProvider client={queryClient}>

      <AuthProvider>

        <App />

      </AuthProvider>

    </QueryClientProvider>

  </React.StrictMode>
);