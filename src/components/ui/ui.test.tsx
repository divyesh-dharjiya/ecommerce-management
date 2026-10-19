// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DataTable, Modal, SegmentedControl, type Column } from "@/components/ui";

afterEach(cleanup);

describe("Modal focus management", () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>open</button>
        <button>behind</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Dialog">
          <button>first</button>
          <button>last</button>
        </Modal>
      </>
    );
  }

  it("keeps Tab focus inside the dialog and restores it on close", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByText("open");
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    await vi.waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));

    // Focus must land on the dialog's own buttons and cycle — not just stay on the container.
    const visited = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const active = document.activeElement as HTMLElement;
      expect(dialog.contains(active)).toBe(true);
      visited.add(active.getAttribute("aria-label") ?? active.textContent ?? "");
      await user.tab();
    }
    expect([...visited].sort()).toEqual(["Close", "first", "last"]);

    // Shift+Tab from the first control wraps to the last one.
    (dialog.querySelector("button") as HTMLElement).focus();
    await user.tab({ shift: true });
    expect(document.activeElement?.textContent).toBe("last");

    await user.keyboard("{Escape}");
    await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});

describe("SegmentedControl keyboard support", () => {
  const options = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
    { value: "c", label: "C" },
  ] as const;

  function Harness({ onChange }: { onChange: (v: string) => void }) {
    const [v, setV] = useState<"a" | "b" | "c">("a");
    return (
      <SegmentedControl
        label="Pick"
        options={options}
        value={v}
        onChange={(x) => {
          setV(x);
          onChange(x);
        }}
      />
    );
  }

  it("moves selection with arrows, wraps, and supports Home/End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    screen.getByRole("radio", { name: "A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("b");
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("a"); // wrapped
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("c");
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("makes only the selected option tabbable (roving tabindex)", () => {
    render(<Harness onChange={() => {}} />);
    const tabbable = screen.getAllByRole("radio").filter((r) => r.getAttribute("tabindex") === "0");
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]!.textContent).toBe("A");
  });
});

describe("DataTable", () => {
  type Row = { id: string; name: string; qty: number };
  const rows: Row[] = [
    { id: "1", name: "Banana", qty: 5 },
    { id: "2", name: "Apple", qty: 9 },
    { id: "3", name: "Cherry", qty: 1 },
  ];
  const columns: Column<Row>[] = [
    { id: "name", header: "Name", sortValue: (r) => r.name, cell: (r) => r.name },
    { id: "qty", header: "Qty", sortValue: (r) => r.qty, cell: (r) => r.qty },
  ];
  const names = () =>
    screen
      .getAllByRole("row")
      .slice(1)
      .map((r) => within(r).getAllByRole("cell")[1]?.textContent ?? within(r).getAllByRole("cell")[0]?.textContent);

  it("sorts ascending then descending when a header is clicked", async () => {
    const user = userEvent.setup();
    render(<DataTable rows={rows} columns={columns} getRowId={(r) => r.id} />);
    await user.click(screen.getByRole("button", { name: /Name/ }));
    expect(
      screen
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.textContent),
    ).toEqual(["Apple9", "Banana5", "Cherry1"]);
    await user.click(screen.getByRole("button", { name: /Name/ }));
    expect(
      screen
        .getAllByRole("row")
        .slice(1)
        .map((r) => r.textContent),
    ).toEqual(["Cherry1", "Banana5", "Apple9"]);
    void names;
  });

  it("selects rows and exposes them to bulk actions", async () => {
    const user = userEvent.setup();
    const onBulk = vi.fn();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        bulkActions={(ids) => <button onClick={() => onBulk(ids)}>act</button>}
      />,
    );
    const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
    await user.click(boxes[0]!);
    await user.click(boxes[2]!);
    await user.click(screen.getByText("act"));
    expect(onBulk).toHaveBeenCalledWith(["1", "3"]);
  });

  it("paginates and resets to page 1 when resetKey changes", async () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `N${i}`, qty: i }));
    const user = userEvent.setup();
    const { rerender } = render(
      <DataTable rows={many} columns={columns} getRowId={(r) => r.id} pageSize={10} resetKey="a" />,
    );
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(screen.getByText(/Showing 11–20 of 25/)).toBeTruthy();
    rerender(<DataTable rows={many} columns={columns} getRowId={(r) => r.id} pageSize={10} resetKey="b" />);
    expect(screen.getByText(/Showing 1–10 of 25/)).toBeTruthy();
  });
});
