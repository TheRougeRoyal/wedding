'use client';

import { cn } from '@/lib/utils';

export function Logo({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8 w-8', className)}
    >
      <path
        d="M16 28s-12-7.7-14.9-15.4C-0.3 5.1 2.7 1.1 8.2 1.1c3.2 0 6.1 1.9 8.6 4.8 2.5-2.9 5.4-4.8 8.6-4.8 5.5 0 8.5 4 7.1 11.5C28 20.3 16 28 16 28z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M11 16.5h10M16 12v9"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
