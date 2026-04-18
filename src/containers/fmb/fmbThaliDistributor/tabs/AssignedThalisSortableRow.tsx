import { memo } from "react";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicator from "@mui/icons-material/DragIndicator";
import { Checkbox, TableCell, TableRow, Typography } from "@mui/material";

import type { AssignmentRow } from "./assignedThalisUtils";
import { assignmentThaliId, thaliDeliveryLine } from "./assignedThalisUtils";

type Props = {
  /** Stable id for @dnd-kit (thali id when present, else row key). */
  sortId: string;
  row: AssignmentRow;
  busy: boolean;
  selectedToUnassign: Set<string>;
  onToggleSelected: (fmbThaliId: string) => void;
};

function AssignedThalisSortableRowInner({
  sortId,
  row: a,
  busy,
  selectedToUnassign,
  onToggleSelected,
}: Props) {
  const thali = a?.fmbThali;
  const thaliId = assignmentThaliId(a);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortId,
    disabled: busy || !thaliId,
    /** Keep “make way” motion while dragging; skip post-drop layout animation (no fly from origin). */
    animateLayoutChanges: (args) => (args.isSorting ? defaultAnimateLayoutChanges(args) : false),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} hover sx={{ opacity: isDragging ? 0.45 : 1 }}>
      <TableCell padding="checkbox">
        {thaliId ? (
          <Checkbox
            size="small"
            checked={selectedToUnassign.has(thaliId)}
            onChange={() => onToggleSelected(thaliId)}
            disabled={busy}
            inputProps={{ "aria-label": `Select thali ${thali?.thaliNo ?? thaliId}` }}
          />
        ) : null}
      </TableCell>
      <TableCell
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        title={busy || !thaliId ? undefined : "Drag to reorder"}
        sx={{
          width: 40,
          maxWidth: 40,
          px: 0.5,
          cursor: busy || !thaliId ? "default" : "grab",
          verticalAlign: "middle",
          touchAction: "none",
        }}
      >
        <DragIndicator
          fontSize="small"
          sx={{ color: "action.active", display: "block", mx: "auto" }}
          aria-hidden
        />
      </TableCell>
      <TableCell>{thali?.thaliNo ?? "—"}</TableCell>
      <TableCell>{thali?.fmb?.name ?? "—"}</TableCell>
      <TableCell
        title={thaliDeliveryLine(thali) || undefined}
        sx={{
          width: 420,
          maxWidth: 420,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          verticalAlign: "middle",
        }}
      >
        <Typography variant="body2" component="span" noWrap>
          {thaliDeliveryLine(thali) || "—"}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

export default memo(AssignedThalisSortableRowInner);
