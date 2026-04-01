import type { ReactNode } from "react";

export type ScreenLayoutProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  children?: ReactNode;
};

export type ScreenLayoutContextValue = { headerHeight: number };
