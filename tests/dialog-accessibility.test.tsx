import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/easeitr/confirmation-dialog";

describe("confirmation dialog accessibility", () => {
  it("provides a named alert dialog and a cancel action", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmationDialog
        trigger={<Button>Clear data</Button>}
        title="Clear all local assessment data?"
        description="This removes saved answers."
        confirmLabel="Clear data"
        onConfirm={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Clear data" }));
    const dialog = screen.getByRole("alertdialog", {
      name: "Clear all local assessment data?",
    });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});
