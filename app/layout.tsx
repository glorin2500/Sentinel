import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import Shell from "@/components/layout/shell";

const urbanist = Urbanist({
    subsets: ["latin"],
    variable: "--font-urbanist",
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Sentinel | UPI Fraud Detection",
    description: "Premium AI-powered UPI safety dashboard",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${urbanist.variable} font-sans antialiased bg-background text-foreground`}>
                <Shell>{children}</Shell>
            </body>
        </html>
    );
}
