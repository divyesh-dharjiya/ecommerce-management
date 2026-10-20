"use client";

import { useId } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="max-w-md">
      <div className="p-6">
        <span className="grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="size-6" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-bold">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} data-autofocus>
            {cancelLabel}
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
