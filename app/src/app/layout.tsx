import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NexoSalud | Medical Interoperability Dashboard",
    description: "Plataforma de interoperabilidad para Resolución 1888 de 2025",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
            </head>
            <body className={inter.className} suppressHydrationWarning>{children}</body>
        </html>
    );
}
