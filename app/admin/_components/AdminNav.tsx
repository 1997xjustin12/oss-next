'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, FileCog, Inbox, Type } from 'lucide-react';
import { ADMIN_NAV } from '@/config/admin';

// The only client component in the admin shell. It exists solely to mark the
// current section — a layout can't read the pathname on the server, and the
// alternative (threading an `active` prop through every admin page) is more
// plumbing than this costs.

const ICONS = { FileCog, Type, Bot, Inbox } as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = ICONS[item.icon];

        return (
          <li key={item.href} className="shrink-0 lg:shrink">
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-theme-primary/10 text-theme-primary dark:bg-theme-primary/20 dark:text-red-300'
                  : 'text-theme-mid hover:bg-theme-subtle hover:text-theme-dark dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block whitespace-nowrap">{item.label}</span>
                {/* The two sections both talk about "titles" — the hint is what
                    stops someone editing a meta tag when they meant the H1. */}
                <span className="hidden text-[11px] font-normal text-theme-muted lg:block dark:text-neutral-500">
                  {item.hint}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
