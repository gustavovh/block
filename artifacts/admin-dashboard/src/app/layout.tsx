import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ToastContainer } from "@/components/ui/toast-container";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLOCK Fit - Admin Dashboard",
  description: "Professional administration dashboard for BLOCK Fit app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
