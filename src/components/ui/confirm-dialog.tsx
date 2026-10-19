"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <span className="grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} data-autofocus>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
