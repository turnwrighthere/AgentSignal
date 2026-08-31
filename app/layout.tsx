import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AgentSignal — Better websites from AI-assisted visits', description: 'Privacy-conscious feedback for website owners.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
