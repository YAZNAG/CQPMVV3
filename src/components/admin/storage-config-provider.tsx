"use client";

import { createContext, useContext } from "react";

type StorageConfig = {
  cloudEnabled: boolean;
};

const StorageConfigContext = createContext<StorageConfig>({ cloudEnabled: false });

export function StorageConfigProvider({
  cloudEnabled,
  children,
}: {
  cloudEnabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <StorageConfigContext.Provider value={{ cloudEnabled }}>
      {children}
    </StorageConfigContext.Provider>
  );
}

export function useStorageConfig() {
  return useContext(StorageConfigContext);
}
