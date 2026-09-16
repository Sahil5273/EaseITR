"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  HelpCircle,
  Home,
  Menu,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

export const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/assessment", label: "Assessment", icon: FileText },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function Navigation({
  mobile = false,
  onItemClick,
}: {
  mobile?: boolean;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const items = mobile ? navItems : navItems.filter((i) => i.href !== "/");

  return (
    <nav
      className={cn("flex", mobile ? "flex-col gap-1" : "items-center gap-1")}
      aria-label={mobile ? "Mobile navigation" : "Application navigation"}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href === "/assessment" && pathname.startsWith("/assessment/"));
        return (
          <Button
            key={href}
            variant="ghost"
            asChild
            onClick={onItemClick}
            className={cn(
              "justify-start rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
            )}
          >
            <Link href={href} aria-current={active ? "page" : undefined}>
              <Icon className="size-4 mr-2" aria-hidden="true" />
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

export function AppShellHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />
        <div className="ml-auto hidden lg:block">
          <Navigation />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-lg"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,340px)] p-6 bg-white border-l border-slate-200 dark:bg-slate-950 dark:border-slate-800"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <Brand />
              <div className="mt-8">
                <Navigation mobile onItemClick={() => setOpen(false)} />
              </div>
              <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                EaseITR is an independent tax-assistance prototype.
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  children,
  width = "wide",
}: {
  children: React.ReactNode;
  width?: "wide" | "reading";
}) {
  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppShellHeader />
      <main
        className={cn(
          "mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
          width === "wide" ? "max-w-[1440px]" : "max-w-5xl",
        )}
      >
        {children}
      </main>
    </div>
  );
}
