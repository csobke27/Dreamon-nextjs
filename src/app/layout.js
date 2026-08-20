import localFont from "next/font/local";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.scss";

import SiteShell from "./site-shell";

const museo700 = localFont({
  src: "../../public/fonts/Museo 700.otf",
  variable: "--font-museo-700",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Dreamon | Home",
    template: "%s",
  },
  description:
    "Dreamon Interactive is an independent game studio building story-driven games, including Nyx Legacy.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/Dreamonbrandmerk-no-background.png",
    apple: "/images/Dreamonbrandmerk-no-background.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={museo700.variable}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}