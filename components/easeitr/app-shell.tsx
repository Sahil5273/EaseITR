"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, HelpCircle, Menu, Settings2 } from "lucide-react";

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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/assessment", label: "Assessment", icon: FileText },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex", mobile ? "flex-col gap-1" : "items-center gap-1")}
      aria-label={mobile ? "Mobile navigation" : "Application navigation"}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href === "/assessment" && pathname.startsWith("/assessment/"));
        return (
          <Button
            key={href}
            variant="ghost"
            asChild
            className={cn(
              "justify-start rounded-xl",
              active &&
                "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
            )}
          >
            <Link href={href}>
              <Icon />
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
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
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-background/95 backdrop-blur dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Brand />
          <div className="ml-auto hidden lg:block">
            <Navigation />
          </div>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(88vw,340px)] p-6">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand />
                <div className="mt-8">
                  <Navigation mobile />
                </div>
                <p className="mt-8 border-t pt-5 text-sm leading-6 text-slate-500">
                  Independent tax-assistance prototype. Estimates are not
                  professional tax advice.
                </p>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
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
