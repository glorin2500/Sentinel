"use client";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Standalone auth layout - NO Shell, NO header, NO navbar
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
            {children}
        </div>
    );
}
