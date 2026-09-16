import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppShellHeader } from "@/components/easeitr/app-shell";
import NotFound from "@/app/not-found";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("mobile menu and 404 page", () => {
  it("renders mobile menu trigger in header", () => {
    render(<AppShellHeader />);
    expect(
      screen.getByRole("button", { name: /open navigation menu/i }),
    ).toBeInTheDocument();
  });

  it("opens navigation drawer when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<AppShellHeader />);
    const trigger = screen.getByRole("button", { name: /open navigation menu/i });
    await user.click(trigger);
    expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeInTheDocument();
  });

  it("renders custom 404 page with navigation links", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /start assessment/i })).toHaveAttribute("href", "/assessment");
    expect(screen.getByRole("link", { name: /sample dashboard/i })).toHaveAttribute("href", "/dashboard");
  });
});
