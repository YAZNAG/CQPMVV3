import type { ApplicationStatus } from "@prisma/client";
import { APPLICATION_STATUS_LABELS, STATUS_BADGE_CLASSES } from "@/lib/admission/status";
import { cn } from "@/lib/utils";

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_BADGE_CLASSES[status],
        className
      )}
    >
      {APPLICATION_STATUS_LABELS[status].admin}
    </span>
  );
}
