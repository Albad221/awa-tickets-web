"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/navigation";

interface HeaderProps {
  displayName: string;
  email: string;
}

function initials(name: string, email: string): string {
  const source = (name || email).trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] || "A") + (parts[1]?.[0] || parts[0]?.[1] || "W")).toUpperCase();
}

export function Header({ displayName, email }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:px-6">
      {/* Mobile menu */}
      <details className="group md:hidden">
        <summary className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted cursor-pointer list-none">
          <Menu className="h-5 w-5" />
        </summary>
        <div className="fixed inset-0 z-50 bg-black/40 group-open:block hidden" />
        <nav className="fixed left-0 top-0 z-50 h-full w-72 bg-card border-r p-4 space-y-6 group-open:block hidden">
          <div className="flex h-10 items-center px-3">
            <span className="text-lg font-semibold">AWA Tickets</span>
          </div>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
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
      </details>

      <div>
        <p className="text-sm font-semibold">AWA Tickets</p>
        <p className="text-xs text-muted-foreground">Portail Organisateur</p>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium leading-none">{displayName || email}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {initials(displayName, email)}
        </div>
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
