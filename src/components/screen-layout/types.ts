import type { ReactNode } from "react";

export type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children?: ReactNode;
};

export type ScreenLayoutContextValue = { headerHeight: number };
