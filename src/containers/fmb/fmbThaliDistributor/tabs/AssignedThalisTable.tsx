import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "react-admin";
import {
  Button as MuiButton,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";

import { tagsCell } from "./AddThalisDialog";
import AssignedThalisSortableRow from "./AssignedThalisSortableRow";
import type { AssignmentRow } from "./assignedThalisUtils";
import {
  assignmentThaliId,
  filterAssignmentsByQuery,
  thaliDeliveryLine,
} from "./assignedThalisUtils";

type SortableColumn = "thaliId" | "thaliNo" | "name" | "address" | "type" | "tags" | "listOrder";

function sortKeyForRow(
  row: AssignmentRow,
  column: SortableColumn,
  listOrderByThaliId: Map<string, number>
): string {
  const t = row.fmbThali;
  const id = assignmentThaliId(row) ?? "";
  switch (column) {
    case "thaliId":
      return id.toLowerCase();
    case "thaliNo":
      return (t?.thaliNo ?? "").trim().toLowerCase();
    case "name":
      return (t?.fmb?.name ?? "").trim().toLowerCase();
    case "address":
      return thaliDeliveryLine(t).toLowerCase();
    case "type":
      return (t?.thaliType?.name?.trim() || t?.thaliType?.code?.trim() || "").toLowerCase();
    case "tags":
      return (t?.tags ?? []).join(" ").toLowerCase();
    case "listOrder": {
      const idx = listOrderByThaliId.get(id);
      return String(idx ?? 1e9).padStart(10, "0");
    }
    default:
      return "";
  }
}

function rowOrderStorageKey(distributorId: string): string {
  return `fmbAssignedThaliRowOrder:${distributorId}`;
}

function loadRowOrderFromStorage(distributorId: string | number | undefined): string[] | null {
  if (distributorId == null || distributorId === "") return null;
  try {
    const raw = localStorage.getItem(rowOrderStorageKey(String(distributorId)));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === "string")) return null;
    return parsed as string[];
  } catch {
    return null;
  }
}

function saveRowOrderToStorage(
  distributorId: string | number | undefined,
  order: string[] | null
): void {
  if (distributorId == null || distributorId === "") return;
  const key = rowOrderStorageKey(String(distributorId));
  if (order == null || order.length === 0) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, JSON.stringify(order));
}

function seedRowOrderFromAssignments(rows: AssignmentRow[]): string[] {
  return rows.map((a) => assignmentThaliId(a)).filter((id): id is string => Boolean(id));
}

/** Reorder `visibleOrderedIds` (current table order) by @dnd-kit `arrayMove`, then merge into full `base`. */
function reorderThaliIdsForSortableDrop(
  base: string[],
  visibleOrderedIds: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (fromIndex === toIndex) return base;
  const moved = arrayMove([...visibleOrderedIds], fromIndex, toIndex);
  if (moved.length === base.length) {
    const movedSet = new Set(moved);
    if (movedSet.size === base.length && base.every((id) => movedSet.has(id))) {
      return moved;
    }
  }
  const visSet = new Set(visibleOrderedIds);
  let mi = 0;
  return base.map((id) => (visSet.has(id) ? moved[mi++] : id));
}

export type AssignedThalisTableProps = {
  distributorId: string | number | undefined;
  assignments: AssignmentRow[];
  busy: boolean;
  onUnassignOne: (fmbThaliId: string) => Promise<void>;
  onBulkUnassign: (fmbThaliIds: string[]) => Promise<void>;
};

export default function AssignedThalisTable({
  distributorId,
  assignments,
  busy,
  onUnassignOne,
  onBulkUnassign,
}: AssignedThalisTableProps) {
  const [assignedFilter, setAssignedFilter] = useState("");
  const [selectedToUnassign, setSelectedToUnassign] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortableColumn>("thaliNo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  /** When set, row order follows this list (also persisted per distributor). `null` = column sort only. */
  const [rowOrderIds, setRowOrderIds] = useState<string[] | null>(null);
  const hadAssignmentsRef = useRef(false);
  /** When true, drag handles and row drops are enabled. */
  const [deliveryOrderMode, setDeliveryOrderMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredAssignments = useMemo(
    () => filterAssignmentsByQuery(assignments, assignedFilter),
    [assignments, assignedFilter]
  );

  const filteredThaliIds = useMemo(
    () =>
      filteredAssignments
        .map((a) => assignmentThaliId(a))
        .filter((id): id is string => Boolean(id)),
    [filteredAssignments]
  );

  const allFilteredSelected =
    filteredThaliIds.length > 0 && filteredThaliIds.every((id) => selectedToUnassign.has(id));
  const someFilteredSelected = filteredThaliIds.some((id) => selectedToUnassign.has(id));

  const listOrderByThaliId = useMemo(() => {
    const m = new Map<string, number>();
    assignments.forEach((a, i) => {
      const id = assignmentThaliId(a);
      if (id) m.set(id, i);
    });
    return m;
  }, [assignments]);

  const sortedFilteredAssignments = useMemo(() => {
    const rows = [...filteredAssignments];
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const va = sortKeyForRow(a, sortBy, listOrderByThaliId);
      const vb = sortKeyForRow(b, sortBy, listOrderByThaliId);
      const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return cmp * dir;
      const ida = assignmentThaliId(a) ?? "";
      const idb = assignmentThaliId(b) ?? "";
      return ida.localeCompare(idb, undefined, { numeric: true }) * dir;
    });
    return rows;
  }, [filteredAssignments, sortBy, sortDir, listOrderByThaliId]);

  const displayRows = useMemo(() => {
    if (!rowOrderIds?.length) return sortedFilteredAssignments;
    const pos = new Map(rowOrderIds.map((id, i) => [id, i]));
    return [...sortedFilteredAssignments].sort((a, b) => {
      const ida = assignmentThaliId(a) ?? "";
      const idb = assignmentThaliId(b) ?? "";
      return (pos.get(ida) ?? 1e9) - (pos.get(idb) ?? 1e9);
    });
  }, [sortedFilteredAssignments, rowOrderIds]);

  const sortableIds = useMemo(
    () =>
      displayRows.map((a, index) => {
        const tid = assignmentThaliId(a);
        return tid ?? String(a?.id ?? `row-${index}`);
      }),
    [displayRows]
  );

  const skipNextRowOrderPersistRef = useRef(false);

  useEffect(() => {
    hadAssignmentsRef.current = false;
    setDeliveryOrderMode(false);
    skipNextRowOrderPersistRef.current = true;
    setRowOrderIds(loadRowOrderFromStorage(distributorId));
  }, [distributorId]);

  useEffect(() => {
    if (distributorId == null || distributorId === "") return;
    if (skipNextRowOrderPersistRef.current) {
      skipNextRowOrderPersistRef.current = false;
      return;
    }
    saveRowOrderToStorage(distributorId, rowOrderIds);
  }, [distributorId, rowOrderIds]);

  useEffect(() => {
    if (assignments.length === 0) {
      if (hadAssignmentsRef.current) {
        setRowOrderIds(null);
      }
      return;
    }
    hadAssignmentsRef.current = true;
    const valid = new Set(
      assignments.map((a) => assignmentThaliId(a)).filter((id): id is string => Boolean(id))
    );
    setRowOrderIds((prev) => {
      if (!prev) return prev;
      const kept = prev.filter((id) => valid.has(id));
      const extras = seedRowOrderFromAssignments(assignments).filter((id) => !kept.includes(id));
      const merged = [...kept, ...extras];
      return merged.length > 0 ? merged : null;
    });
  }, [assignments]);

  const requestSort = useCallback(
    (column: SortableColumn) => {
      if (deliveryOrderMode) return;
      setRowOrderIds(null);
      if (sortBy === column) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(column);
        setSortDir("asc");
      }
    },
    [deliveryOrderMode, sortBy]
  );

  const clearRowOrder = useCallback(() => {
    setRowOrderIds(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);
      const fromIndex = active.data.current?.sortable?.index;
      const toIndex = over.data.current?.sortable?.index;

      setRowOrderIds((prev) => {
        const base = prev ?? seedRowOrderFromAssignments(assignments);
        if (typeof fromIndex === "number" && typeof toIndex === "number") {
          return reorderThaliIdsForSortableDrop(base, sortableIds, fromIndex, toIndex);
        }
        const from = base.indexOf(activeId);
        const to = base.indexOf(overId);
        if (from === -1 || to === -1) return prev ?? base;
        return arrayMove(base, from, to);
      });
    },
    [assignments, sortableIds]
  );

  const exitDeliveryOrderMode = useCallback(() => {
    setDeliveryOrderMode(false);
  }, []);

  useEffect(() => {
    const valid = new Set(
      assignments.map((a) => assignmentThaliId(a)).filter((id): id is string => Boolean(id))
    );
    setSelectedToUnassign((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next;
    });
  }, [assignments]);

  const toggleThaliSelected = useCallback((fmbThaliId: string) => {
    setSelectedToUnassign((prev) => {
      const next = new Set(prev);
      if (next.has(fmbThaliId)) next.delete(fmbThaliId);
      else next.add(fmbThaliId);
      return next;
    });
  }, []);

  const toggleSelectAllFiltered = useCallback(() => {
    setSelectedToUnassign((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredThaliIds.forEach((id) => next.delete(id));
      } else {
        filteredThaliIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [allFilteredSelected, filteredThaliIds]);

  const sortLabelsSx = deliveryOrderMode
    ? { pointerEvents: "none" as const, opacity: 0.55 }
    : undefined;

  const tableHead = (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            size="small"
            checked={allFilteredSelected}
            indeterminate={someFilteredSelected && !allFilteredSelected}
            onChange={() => toggleSelectAllFiltered()}
            disabled={busy || filteredThaliIds.length === 0}
            inputProps={{ "aria-label": "Select all visible assigned thalis" }}
          />
        </TableCell>
        {deliveryOrderMode ? (
          <TableCell sx={{ width: 40, maxWidth: 40, px: 0.5 }} aria-label="Reorder rows" />
        ) : null}
        <TableCell>
          <TableSortLabel
            active={sortBy === "thaliNo"}
            direction={sortBy === "thaliNo" ? sortDir : "asc"}
            onClick={() => requestSort("thaliNo")}
            sx={sortLabelsSx}
          >
            Thali no.
          </TableSortLabel>
        </TableCell>
        <TableCell>
          <TableSortLabel
            active={sortBy === "name"}
            direction={sortBy === "name" ? sortDir : "asc"}
            onClick={() => requestSort("name")}
            sx={sortLabelsSx}
          >
            Name
          </TableSortLabel>
        </TableCell>
        <TableCell sx={{ width: 420, minWidth: 420, maxWidth: 420 }}>
          <TableSortLabel
            active={sortBy === "address"}
            direction={sortBy === "address" ? sortDir : "asc"}
            onClick={() => requestSort("address")}
            sx={sortLabelsSx}
          >
            Delivery address
          </TableSortLabel>
        </TableCell>
        {!deliveryOrderMode ? (
          <>
            <TableCell>
              <TableSortLabel
                active={sortBy === "type"}
                direction={sortBy === "type" ? sortDir : "asc"}
                onClick={() => requestSort("type")}
                sx={sortLabelsSx}
              >
                Type
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === "tags"}
                direction={sortBy === "tags" ? sortDir : "asc"}
                onClick={() => requestSort("tags")}
                sx={sortLabelsSx}
              >
                Tags
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === "listOrder"}
                direction={sortBy === "listOrder" ? sortDir : "asc"}
                onClick={() => requestSort("listOrder")}
                sx={sortLabelsSx}
              >
                Actions
              </TableSortLabel>
            </TableCell>
          </>
        ) : null}
      </TableRow>
    </TableHead>
  );

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle1">Currently assigned</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          useFlexGap
          sx={{ flex: 1, minWidth: 0, justifyContent: { sm: "flex-end" } }}
        >
          <MuiTextField
            size="small"
            margin="none"
            hiddenLabel
            fullWidth
            placeholder="Filter: thali no, ITS, name, address, mohallah, type, tags…"
            aria-label="Filter assigned thalis"
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            disabled={busy}
            sx={{ minWidth: { sm: 200 }, maxWidth: { sm: 320 }, flex: { sm: "1 1 200px" } }}
          />
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            <MuiButton
              size="small"
              variant="outlined"
              disabled={busy || deliveryOrderMode || selectedToUnassign.size === 0}
              onClick={() => void onBulkUnassign(Array.from(selectedToUnassign))}
            >
              Unassign selected
            </MuiButton>
            {deliveryOrderMode ? (
              <MuiButton
                size="small"
                variant="contained"
                disabled={busy}
                onClick={exitDeliveryOrderMode}
              >
                Done ordering
              </MuiButton>
            ) : (
              <MuiButton
                size="small"
                variant="contained"
                disabled={busy || filteredAssignments.length < 2}
                onClick={() => setDeliveryOrderMode(true)}
              >
                Set delivery order
              </MuiButton>
            )}
            <MuiButton
              size="small"
              variant="outlined"
              disabled={busy || deliveryOrderMode || rowOrderIds === null}
              onClick={clearRowOrder}
            >
              Reset row order
            </MuiButton>
          </Stack>
        </Stack>
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        {deliveryOrderMode
          ? "Drag the handle on each row to change delivery order (saved for this distributor). Click Done ordering when finished."
          : 'Click "Set delivery order" to reorder rows. Order is saved for this distributor. Sorting a column clears custom row order.'}
      </Typography>

      {filteredAssignments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {assignments.length === 0 ? "No thalis assigned yet." : "No rows match this filter."}
        </Typography>
      ) : (
        <TableContainer
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            maxWidth: "100%",
          }}
        >
          {deliveryOrderMode ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              autoScroll={false}
              onDragEnd={handleDragEnd}
            >
              <Table size="small" sx={{ minWidth: 560 }}>
                {tableHead}
                <TableBody>
                  <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                    {displayRows.map((a, index) => {
                      const thaliId = assignmentThaliId(a);
                      const rowKey = a?.id ?? thaliId ?? `row-${index}`;
                      const sortId = sortableIds[index] ?? String(rowKey);
                      return (
                        <AssignedThalisSortableRow
                          key={rowKey}
                          sortId={sortId}
                          row={a}
                          busy={busy}
                          selectedToUnassign={selectedToUnassign}
                          onToggleSelected={toggleThaliSelected}
                        />
                      );
                    })}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          ) : (
            <Table size="small" sx={{ minWidth: 820 }}>
              {tableHead}
              <TableBody>
                {displayRows.map((a, index) => {
                  const thali = a?.fmbThali;
                  const thaliId = assignmentThaliId(a);
                  const rowKey = a?.id ?? thaliId ?? `row-${index}`;
                  return (
                    <TableRow key={rowKey} hover>
                      <TableCell padding="checkbox">
                        {thaliId ? (
                          <Checkbox
                            size="small"
                            checked={selectedToUnassign.has(thaliId)}
                            onChange={() => toggleThaliSelected(thaliId)}
                            disabled={busy}
                            inputProps={{
                              "aria-label": `Select thali ${thali?.thaliNo ?? thaliId}`,
                            }}
                          />
                        ) : null}
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
                      <TableCell>
                        {thali?.thaliType?.name?.trim() || thali?.thaliType?.code?.trim() || "—"}
                      </TableCell>
                      <TableCell>{tagsCell(thali?.tags)}</TableCell>
                      <TableCell align="right">
                        <Button
                          label="Remove"
                          onClick={() => (thaliId ? void onUnassignOne(thaliId) : undefined)}
                          disabled={busy || !thaliId}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}
    </>
  );
}
