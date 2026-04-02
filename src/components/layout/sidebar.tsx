"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/navigation";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/events" className="text-lg font-semibold tracking-tight">
          AWA Tickets
        </Link>
      </div>
      <nav className="flex-1 space-y-6 p-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
