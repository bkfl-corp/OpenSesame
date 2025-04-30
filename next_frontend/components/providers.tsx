"use client";

import { AppProgressBar } from "next-nprogress-bar";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { ThemeProvider } from "./theme-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <AppProgressBar
          height="3px"
          color="#29D"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
