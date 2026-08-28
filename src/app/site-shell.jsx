"use client";

import { usePathname } from "next/navigation";

import Footer from "../components/footer/footer.component";
import Navigation from "../routes/navigation/navigation.component";

const DEFAULT_THEME = {
  accent: "#72D822",
  accentDark: "#345e0f",
  outletBg: "black",
  cardAccent: "#72D822",
};

const BLOG_THEME = {
  ...DEFAULT_THEME,
  cardAccent: "black",
};

const NYX_THEME = {
  accent: "rgb(210 128 54)",
  accentDark: "rgb(148 83 27)",
  outletBg: "rgb(210 128 54)",
  cardAccent: "rgb(210 128 54)",
};

function getThemeForPath(pathname) {
  if (pathname.startsWith("/nyx-legacy")) {
    return NYX_THEME;
  }

  if (pathname === "/blog") {
    return BLOG_THEME;
  }

  return DEFAULT_THEME;
}

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const isStudioRoute = pathname === "/studio" || pathname.startsWith("/studio/");
  const theme = getThemeForPath(pathname);

  if (isStudioRoute) return children;

  return (
    <div
      style={{
        "--theme-color": theme.accent,
        "--theme-color-dark": theme.accentDark,
        "--outlet-bg": theme.outletBg,
        "--card-theme-color": theme.cardAccent,
      }}
    >
      <Navigation />
      <main className="outlet-container">{children}</main>
      <Footer />
    </div>
  );
}