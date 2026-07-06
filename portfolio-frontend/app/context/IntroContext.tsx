"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface IntroContextType {
  introDisabled: boolean;
  setIntroDisabled: (value: boolean) => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introDisabled, setIntroDisabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("introDisabled");
    if (saved === "true") {
      setIntroDisabled(true);
    }
  }, []);

  const handleSetIntroDisabled = (value: boolean) => {
    setIntroDisabled(value);
    localStorage.setItem("introDisabled", String(value));
  };

  return (
    <IntroContext.Provider value={{ introDisabled, setIntroDisabled: handleSetIntroDisabled }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error("useIntro must be used within IntroProvider");
  }
  return context;
}
