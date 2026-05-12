import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ChatWidget } from "@/components/ChatWidget";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Finacle - Personal Finance",
  description: "Premium personal finance budget app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
