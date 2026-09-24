import { XCircle } from "lucide-react";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ResultsErrorDialogProps {
  open: boolean;
  message: string;
  details?: string;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
}

export function ResultsErrorDialog({
  open,
  message,
  details,
  onOpenChange,
  onDismiss,
}: ResultsErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <XCircle />
            <DialogTitle>Error</DialogTitle>
          </div>
        </DialogHeader>
        <div className="pt-4">
          <p className="mb-2">{message}</p>
          {details && (
            <p className="text-muted-foreground text-sm">{details}</p>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={onDismiss}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
