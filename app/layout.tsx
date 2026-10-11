import type { Metadata, Viewport } from 'next';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import 'katex/dist/katex.min.css';
import 'dockview-react/dist/styles/dockview.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Principia',
  description: 'A split-pane workspace for notes folders: structured topics, Markdown, MDX and live React components.',
};

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#0e1218' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
