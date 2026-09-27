"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  FileText,
  HelpCircle,
  Home,
  LogIn,
  LogOut,
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
import { FilingModeBar } from "./filing-panels";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/state/auth-context";
import { toast } from "sonner";

export const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/assessment", label: "Assessment", icon: FileText },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/results", label: "Results", icon: ClipboardList },
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
              "justify-start rounded-xl text-sm font-medium",
              active &&
                "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold",
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
  const { user, signIn, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />
        <div className="ml-auto hidden lg:block">
          <Navigation />
        </div>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <Button
            variant="ghost"
            className="rounded-xl"
            aria-label={user ? "Sign out" : "Sign in with Google"}
            onClick={() => {
              if (user) void signOutUser();
              else
                void signIn().catch(() =>
                  toast.error("Google sign-in did not finish. Try again."),
                );
            }}
          >
            {user ? <LogOut /> : <LogIn />}
            <span className="hidden md:inline">{user ? "Sign out" : "Sign in"}</span>
          </Button>
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(88vw,340px)] p-6 bg-card"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <Brand />
              <div className="mt-8">
                <Navigation mobile onItemClick={() => setOpen(false)} />
              </div>
              <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-6 text-slate-500 dark:border-slate-800">
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
  width?: "wide" | "reading" | "full";
}) {
  return (
    <div className="min-h-screen text-foreground">
      <AppShellHeader />
      <FilingModeBar />
      <main
        className={cn(
          "mx-auto w-full py-6 sm:py-8 lg:py-8",
          width === "full"
            ? "max-w-full px-4 sm:px-6 lg:px-8"
            : width === "wide"
            ? "max-w-[1600px] px-4 sm:px-6 lg:px-8"
            : "max-w-5xl px-4 sm:px-6 lg:px-8",
        )}
      >
        {children}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:px-8"
          aria-label="Legal"
        >
          <Link href="/privacy" className="hover:text-emerald-800">
            Privacy policy
          </Link>
          <Link href="/terms" className="hover:text-emerald-800">
            Terms of service
          </Link>
          <Link href="/costs" className="hover:text-emerald-800">
            Running costs
          </Link>
          <Link href="/limitations" className="hover:text-emerald-800">
            Limitations
          </Link>
        </nav>
      </footer>
    </div>
  );
}
