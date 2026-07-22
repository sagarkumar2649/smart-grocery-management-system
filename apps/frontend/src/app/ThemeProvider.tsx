import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { getSystemTheme, applyThemeToDom } from "@/store/slices/app-ui.slice";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((s) => s.appUi.theme);

  useEffect(() => {
    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeToDom(getSystemTheme());
    mq.addEventListener("change", handler);
    handler();

    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}
