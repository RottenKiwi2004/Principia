'use client';

import { useEffect, useState } from 'react';

const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

/** A small, quiet clock in the bottom-right corner. It renders nothing on the server, so there is no hydration mismatch. */
export function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;
  return (
    <time className="clock" dateTime={now.toISOString()} aria-label={`Time ${fmt(now)}`}>
      {fmt(now)}
    </time>
  );
}
