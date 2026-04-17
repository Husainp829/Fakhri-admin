import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import type { Identifier, RaRecord } from "react-admin";
import {
  Button,
  Datagrid,
  FunctionField,
  ListContextProvider,
  Pagination,
  ResourceContextProvider,
  TextField,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import type { ListControllerResult } from "ra-core";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";

import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

import { useReportAssignmentsTabTotal } from "../AssignmentsTabCountContext";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_SEARCH_ROWS_PER_PAGE = 25;
const SEARCH_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

/** Thali row as a react-admin record (Datagrid / fields). */
const THALI_SEARCH_RESOURCE = "fmbData";

interface FmbThaliRow {
  id?: string;
  thaliNo?: string;
  deliveryMohallah?: string;
  thaliType?: { id?: string; name?: string | null; code?: string | null } | null;
  fmb?: { itsNo?: string; name?: string };
  /** Serialized from API (`fmbThaliTag` rows). */
  tags?: string[];
}

type ThaliSearchRecord = FmbThaliRow & RaRecord;

interface AssignmentRow {
  id?: string;
  fmbThaliId?: string;
  fmbThali?: FmbThaliRow;
}

function thaliLabel(t: FmbThaliRow): string {
  const thaliNo = t?.thaliNo ?? "—";
  const its = t?.fmb?.itsNo ?? "—";
  const name = t?.fmb?.name ?? "—";
  const moh = t?.deliveryMohallah ?? "—";
  return `${thaliNo} · ITS ${its} · ${name} · ${moh}`;
}

function assignmentThaliId(a: AssignmentRow): string | undefined {
  const id = a?.fmbThaliId ?? a?.fmbThali?.id;
  return id ? String(id) : undefined;
}

function tagsCell(tags: string[] | undefined) {
  if (!tags?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }
  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap" useFlexGap sx={{ py: 0.25 }}>
      {tags.map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}

/**
 * Stable group key for thali type breakdown. When `thaliType.id` is omitted from the API
 * payload, every row must not share a single `__none` bucket — use name/code so Medium vs
 * Small stay distinct.
 */
function assignmentThaliTypeGroupKey(tt: FmbThaliRow["thaliType"] | null | undefined): string {
  if (!tt) return "__none";
  const rawId = tt.id != null ? String(tt.id).trim() : "";
  if (rawId) return `id:${rawId}`;
  const name = (tt.name ?? "").trim().toLowerCase();
  const code = (tt.code ?? "").trim().toLowerCase();
  if (name || code) return `label:${name}\0${code}`;
  return "__none";
}

/** Counts assigned thalis by `fmbThali.thaliType`. */
function buildAssignedThaliTypeBreakdown(
  rows: AssignmentRow[]
): { id: string; name: string; count: number }[] {
  const byKey = new Map<string, { name: string; count: number }>();
  for (const a of rows) {
    const tt = a?.fmbThali?.thaliType;
    const key = assignmentThaliTypeGroupKey(tt);
    const label = (tt?.name?.trim() || tt?.code?.trim() || "Unspecified").trim() || "Unspecified";
    const prev = byKey.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      byKey.set(key, { name: label, count: 1 });
    }
  }
  return [...byKey.entries()]
    .map(([id, v]) => ({ id, name: v.name, count: v.count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function rowsFromResponse(json: unknown): unknown[] {
  if (
    json &&
    typeof json === "object" &&
    "rows" in json &&
    Array.isArray((json as { rows: unknown }).rows)
  ) {
    return (json as { rows: unknown[] }).rows;
  }
  return [];
}

function parseThaliSearchResponse(json: unknown): {
  rows: FmbThaliRow[];
  totalCount: number;
  page: number;
  pageSize: number;
} {
  const rows = rowsFromResponse(json) as FmbThaliRow[];
  if (json && typeof json === "object") {
    const o = json as {
      totalCount?: unknown;
      page?: unknown;
      pageSize?: unknown;
    };
    const totalCount = typeof o.totalCount === "number" ? o.totalCount : rows.length;
    const page = typeof o.page === "number" ? o.page : 0;
    const pageSize = typeof o.pageSize === "number" ? o.pageSize : DEFAULT_SEARCH_ROWS_PER_PAGE;
    return { rows, totalCount, page, pageSize };
  }
  return {
    rows,
    totalCount: rows.length,
    page: 0,
    pageSize: DEFAULT_SEARCH_ROWS_PER_PAGE,
  };
}

function emptyListStubs(): Pick<
  ListControllerResult,
  | "defaultTitle"
  | "displayedFilters"
  | "exporter"
  | "filter"
  | "filterValues"
  | "hideFilter"
  | "showFilter"
  | "setFilters"
  | "sort"
  | "resource"
> {
  return {
    sort: { field: "thaliNo", order: "ASC" },
    defaultTitle: "",
    displayedFilters: {},
    exporter: false,
    filter: {},
    filterValues: {},
    hideFilter: () => {},
    showFilter: () => {},
    setFilters: () => {},
    resource: "",
  };
}

export default function AssignmentsTab() {
  const record = useRecordContext();
  const distributorId = record?.id as string | number | undefined;
  const notify = useNotify();
  const refresh = useRefresh();
  const setTabTotalAssigned = useReportAssignmentsTabTotal();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tagFilterInput, setTagFilterInput] = useState<string[]>([]);
  const [debouncedTagFilter, setDebouncedTagFilter] = useState<string[]>([]);
  const [tagSuggestOptions, setTagSuggestOptions] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [thaliSearchResults, setThaliSearchResults] = useState<FmbThaliRow[]>([]);
  const [thaliSearchTotal, setThaliSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [searchRowsPerPage, setSearchRowsPerPage] = useState(DEFAULT_SEARCH_ROWS_PER_PAGE);
  /** Staged thalis to assign (persists across searches). */
  const [pendingAssign, setPendingAssign] = useState<Record<string, FmbThaliRow>>({});

  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [assignedFilter, setAssignedFilter] = useState("");
  const [selectedToUnassign, setSelectedToUnassign] = useState<Set<string>>(new Set());
  const assignmentsLoadForIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedTagFilter([...tagFilterInput]),
      SEARCH_DEBOUNCE_MS
    );
    return () => window.clearTimeout(t);
  }, [tagFilterInput]);

  const debouncedTagsSignature = useMemo(() => debouncedTagFilter.join("\0"), [debouncedTagFilter]);

  useEffect(() => {
    setSearchPage(0);
  }, [debouncedSearch, debouncedTagsSignature]);

  const loadAssignments = useCallback(async () => {
    if (!distributorId) return;
    const sid = String(distributorId);
    if (assignmentsLoadForIdRef.current !== sid) {
      assignmentsLoadForIdRef.current = sid;
      setAssignments([]);
    }
    setBusy(true);
    try {
      const res = await httpClient(
        `${getApiUrl()}/fmbThaliDistribution/assignments?distributorId=${encodeURIComponent(
          String(distributorId)
        )}`,
        { method: "GET" }
      );
      setAssignments(rowsFromResponse(res.json) as AssignmentRow[]);
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Failed to load assignments", { type: "warning" });
    } finally {
      setBusy(false);
    }
  }, [distributorId, notify]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    setTabTotalAssigned(assignments.length);
  }, [assignments.length, setTabTotalAssigned]);

  const loadTagSuggestions = useCallback(async (q: string) => {
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const { json } = await httpClient(
        `${getApiUrl()}/fmbThaliDistribution/thali-tag-suggestions${qs}`
      );
      const rows = (json as { rows?: string[] }).rows ?? [];
      setTagSuggestOptions(rows);
    } catch {
      setTagSuggestOptions([]);
    }
  }, []);

  const debouncedTagSuggest = useMemo(
    () => debounce((q: string) => void loadTagSuggestions(q), 250),
    [loadTagSuggestions]
  );

  useEffect(() => () => debouncedTagSuggest.cancel(), [debouncedTagSuggest]);

  const fetchThalis = useCallback(
    async (opts: { search: string; tags: string[]; page: number; pageSize: number }) => {
      if (!distributorId) return;
      setSearchLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", String(opts.pageSize));
        params.set("page", String(opts.page));
        const t = opts.search.trim();
        if (t) params.set("search", t);
        for (const tag of opts.tags) {
          const trimmed = tag.trim();
          if (trimmed) params.append("tag", trimmed);
        }
        const res = await httpClient(
          `${getApiUrl()}/fmbThaliDistribution/thalis?${params.toString()}`,
          {
            method: "GET",
          }
        );
        const parsed = parseThaliSearchResponse(res.json);
        setThaliSearchResults(parsed.rows);
        setThaliSearchTotal(parsed.totalCount);
      } catch (e: unknown) {
        notify(e instanceof Error ? e.message : "Failed to search thalis", { type: "warning" });
      } finally {
        setSearchLoading(false);
      }
    },
    [distributorId, notify]
  );

  useEffect(() => {
    void fetchThalis({
      search: debouncedSearch,
      tags: debouncedTagFilter,
      page: searchPage,
      pageSize: searchRowsPerPage,
    });
  }, [
    debouncedSearch,
    debouncedTagsSignature,
    searchPage,
    searchRowsPerPage,
    fetchThalis,
    debouncedTagFilter,
  ]);

  const assignedThaliIdSet = useMemo(() => {
    const next = new Set<string>();
    assignments.forEach((a) => {
      if (a?.fmbThaliId) next.add(String(a.fmbThaliId));
      if (a?.fmbThali?.id) next.add(String(a.fmbThali.id));
    });
    return next;
  }, [assignments]);

  const searchRecords = useMemo(
    (): ThaliSearchRecord[] =>
      thaliSearchResults
        .filter((t): t is FmbThaliRow & { id: string } => Boolean(t.id))
        .map((t) => ({ ...t, id: t.id })),
    [thaliSearchResults]
  );

  const selectedIds = useMemo(() => Object.keys(pendingAssign) as Identifier[], [pendingAssign]);

  const onSelect = useCallback(
    (ids: Identifier[]) => {
      const idSet = new Set(ids.map(String));
      setPendingAssign((prev) => {
        const next: Record<string, FmbThaliRow> = {};
        idSet.forEach((id) => {
          if (assignedThaliIdSet.has(id)) return;
          const fromPrev = prev[id];
          const fromPage = thaliSearchResults.find((t) => String(t.id) === id);
          const row = fromPrev ?? fromPage;
          if (row) next[id] = row;
        });
        return next;
      });
    },
    [thaliSearchResults, assignedThaliIdSet]
  );

  const onToggleItem = useCallback(
    (id: Identifier) => {
      const sid = String(id);
      setPendingAssign((prev) => {
        const next = { ...prev };
        if (next[sid]) {
          delete next[sid];
          return next;
        }
        const row = thaliSearchResults.find((t) => String(t.id) === sid);
        if (row && !assignedThaliIdSet.has(sid)) next[sid] = row;
        return next;
      });
    },
    [thaliSearchResults, assignedThaliIdSet]
  );

  const clearPendingAssign = useCallback(() => setPendingAssign({}), []);

  const setListPage = useCallback((pageOneBased: number) => {
    setSearchPage(Math.max(0, pageOneBased - 1));
  }, []);

  const setListPerPage = useCallback((n: number | string) => {
    const v = typeof n === "string" ? Number.parseInt(n, 10) : n;
    if (!Number.isFinite(v)) return;
    setSearchRowsPerPage(v);
    setSearchPage(0);
  }, []);

  const thaliSearchListContext = useMemo((): ListControllerResult<ThaliSearchRecord> => {
    const stubs = emptyListStubs();
    const page = searchPage + 1;
    const perPage = searchRowsPerPage;
    const total = thaliSearchTotal;
    const initialLoad = searchLoading && thaliSearchResults.length === 0;

    const base = {
      ...stubs,
      getData: async () => searchRecords,
      onSelect,
      onSelectAll: () => {},
      onToggleItem,
      onUnselectItems: clearPendingAssign,
      page,
      perPage,
      refetch: () => {
        void fetchThalis({
          search: debouncedSearch,
          tags: debouncedTagFilter,
          page: searchPage,
          pageSize: searchRowsPerPage,
        });
      },
      selectedIds,
      setPage: setListPage,
      setPerPage: setListPerPage,
      setSort: () => {},
      hasNextPage: total > 0 && page * perPage < total,
      hasPreviousPage: page > 1,
      isFetching: searchLoading,
      isLoading: false,
      isPaused: false,
      isPlaceholderData: false,
    };

    if (initialLoad) {
      return {
        ...base,
        isPending: true,
        data: undefined,
        total: undefined,
        meta: undefined,
        error: null,
      } as ListControllerResult<ThaliSearchRecord>;
    }

    return {
      ...base,
      isPending: false,
      data: searchRecords,
      total,
      meta: undefined,
      error: null,
    } as ListControllerResult<ThaliSearchRecord>;
  }, [
    searchPage,
    searchRowsPerPage,
    thaliSearchTotal,
    searchRecords,
    searchLoading,
    thaliSearchResults.length,
    selectedIds,
    onSelect,
    onToggleItem,
    clearPendingAssign,
    fetchThalis,
    debouncedSearch,
    debouncedTagsSignature,
    setListPage,
    setListPerPage,
  ]);

  useEffect(() => {
    setPendingAssign((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const id of assignedThaliIdSet) {
        if (next[id]) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [assignedThaliIdSet]);

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

  const assignedByThaliType = useMemo(
    () => buildAssignedThaliTypeBreakdown(assignments),
    [assignments]
  );

  const filteredAssignments = useMemo(() => {
    const q = assignedFilter.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((a) => {
      const t = a?.fmbThali;
      const typeHay = (
        t?.thaliType?.name?.trim() ||
        t?.thaliType?.code?.trim() ||
        ""
      ).toLowerCase();
      const tagsHay = (t?.tags ?? []).join(" ").toLowerCase();
      const haystack = t
        ? `${thaliLabel(t)} ${typeHay} ${tagsHay}`.toLowerCase()
        : String(a?.fmbThaliId ?? "").toLowerCase();
      return haystack.includes(q);
    });
  }, [assignments, assignedFilter]);

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

  const pendingAssignList = useMemo(
    () => Object.entries(pendingAssign).map(([id, row]) => ({ id, row })),
    [pendingAssign]
  );

  const doAssign = async () => {
    const ids = Object.keys(pendingAssign);
    if (!ids.length) {
      notify("Select thalis in the search results or queue below, then assign", {
        type: "warning",
      });
      return;
    }
    if (!distributorId) return;
    setBusy(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/assign`, {
        method: "POST",
        body: JSON.stringify({ distributorId, fmbThaliIds: ids }),
      });
      notify(`Assigned ${ids.length} thali(s)`, { type: "info" });
      setPendingAssign({});
      await loadAssignments();
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Assign failed", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const doUnassign = async (fmbThaliId: string) => {
    if (!fmbThaliId) return;
    setBusy(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/unassign`, {
        method: "POST",
        body: JSON.stringify({ fmbThaliIds: [fmbThaliId] }),
      });
      notify("Unassigned", { type: "info" });
      setSelectedToUnassign((prev) => {
        const next = new Set(prev);
        next.delete(fmbThaliId);
        return next;
      });
      await loadAssignments();
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Unassign failed", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const doBulkUnassign = async () => {
    const ids = Array.from(selectedToUnassign);
    if (!ids.length) {
      notify("Select at least one assigned thali to remove", { type: "warning" });
      return;
    }
    setBusy(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/unassign`, {
        method: "POST",
        body: JSON.stringify({ fmbThaliIds: ids }),
      });
      notify(`Unassigned ${ids.length} thali(s)`, { type: "info" });
      setSelectedToUnassign(new Set());
      await loadAssignments();
      refresh();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Bulk unassign failed", { type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const toggleThaliSelected = (fmbThaliId: string) => {
    setSelectedToUnassign((prev) => {
      const next = new Set(prev);
      if (next.has(fmbThaliId)) next.delete(fmbThaliId);
      else next.add(fmbThaliId);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedToUnassign((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredThaliIds.forEach((id) => next.delete(id));
      } else {
        filteredThaliIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Search thalis (and optionally restrict by tags — a thali matches if it has{" "}
        <strong>any</strong> of the selected tags), use the datagrid checkboxes to queue rows, then
        assign in one go. The queue is kept when you change search, tag filter, or page. Each thali
        can only be on one distributor at a time.
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Add thalis
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            maxWidth: "100%",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              Search
            </Typography>
            <Stack spacing={1.5}>
              <MuiTextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Thali no., ITS, name, mohallah, or address…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={busy}
              />
              <Autocomplete<string, true, false, true>
                multiple
                freeSolo
                size="small"
                options={tagSuggestOptions}
                value={tagFilterInput}
                onChange={(_, raw) => {
                  const next = (Array.isArray(raw) ? raw : [])
                    .map((x) => String(x).trim())
                    .filter(Boolean);
                  const seen = new Set<string>();
                  const deduped: string[] = [];
                  for (const t of next) {
                    const k = t.toLowerCase();
                    if (seen.has(k)) continue;
                    seen.add(k);
                    deduped.push(t);
                    if (deduped.length >= 20) break;
                  }
                  setTagFilterInput(deduped);
                }}
                onInputChange={(_, input, reason) => {
                  if (reason === "reset") return;
                  if (reason === "clear") {
                    setTagFilterInput([]);
                    debouncedTagSuggest.cancel();
                    return;
                  }
                  if (reason === "input") debouncedTagSuggest(input);
                }}
                onOpen={() =>
                  void loadTagSuggestions(tagFilterInput[tagFilterInput.length - 1] ?? "")
                }
                filterSelectedOptions
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={`${option}-${index}`}
                      size="small"
                      label={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <MuiTextField
                    {...params}
                    label="Tag filter"
                    placeholder="Add tags; thali matches if it has any of them"
                    helperText="Case-insensitive. Combine with text search (both apply). Up to 20 tags."
                    disabled={busy}
                  />
                )}
              />
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button label="Clear search" onClick={() => setSearchInput("")} disabled={busy} />
                <Button
                  label="Clear tags"
                  onClick={() => {
                    setTagFilterInput([]);
                    setDebouncedTagFilter([]);
                  }}
                  disabled={busy || tagFilterInput.length === 0}
                />
                <Typography variant="caption" color="text.secondary">
                  {searchLoading
                    ? "Searching…"
                    : `${thaliSearchTotal.toLocaleString()} match(es).${
                        debouncedTagFilter.length
                          ? ` Must have at least one of: ${debouncedTagFilter.map((x) => `“${x}”`).join(", ")}.`
                          : " Text search matches thali no., ITS, name, mohallah, or address."
                      }`}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          <ResourceContextProvider value={THALI_SEARCH_RESOURCE}>
            <ListContextProvider value={thaliSearchListContext}>
              <Box sx={{ overflowX: "auto", width: "100%" }}>
                <Datagrid
                  bulkActionsToolbar={<Fragment />}
                  bulkActionButtons={<Fragment />}
                  rowClick={false}
                  resource={THALI_SEARCH_RESOURCE}
                  isRowSelectable={(r) => !assignedThaliIdSet.has(String(r.id))}
                  empty={
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No thalis match this search.
                      </Typography>
                    </Box>
                  }
                  sx={{ minWidth: 520 }}
                >
                  <TextField source="thaliNo" label="Thali no." sortable={false} />
                  <TextField source="fmb.itsNo" label="ITS" sortable={false} />
                  <TextField source="fmb.name" label="Name" sortable={false} />
                  <TextField source="address" label="Address" sortable={false} />
                  <TextField source="deliveryMohallah" label="Mohallah" sortable={false} />
                  <FunctionField
                    label="Tags"
                    sortable={false}
                    render={(r: ThaliSearchRecord) => tagsCell(r.tags)}
                  />
                  <FunctionField
                    label="Note"
                    sortable={false}
                    render={(r: ThaliSearchRecord) => (
                      <Typography variant="caption" color="text.secondary">
                        {assignedThaliIdSet.has(String(r.id)) ? "Already on this distributor" : ""}
                      </Typography>
                    )}
                  />
                </Datagrid>
              </Box>
              <Pagination rowsPerPageOptions={[...SEARCH_ROWS_PER_PAGE_OPTIONS]} />
            </ListContextProvider>
          </ResourceContextProvider>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            Ready to assign: <strong>{pendingAssignList.length}</strong>
          </Typography>
          <Button
            label={
              pendingAssignList.length > 0
                ? `Assign ${pendingAssignList.length} thali(s)`
                : "Assign queued thalis"
            }
            onClick={() => void doAssign()}
            disabled={busy || pendingAssignList.length === 0}
          />
          <Button
            label="Clear queue"
            onClick={clearPendingAssign}
            disabled={busy || pendingAssignList.length === 0}
          />
          <Button
            label="Refresh assignments"
            onClick={() => void loadAssignments()}
            disabled={busy}
          />
        </Stack>

        {pendingAssignList.length > 0 ? (
          <TableContainer
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              maxWidth: "100%",
            }}
          >
            <Table size="small" sx={{ minWidth: 480 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Thali no.</TableCell>
                  <TableCell>ITS</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Mohallah</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell align="right">Queue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingAssignList.map(({ id, row }) => (
                  <TableRow key={id} hover>
                    <TableCell>{row?.thaliNo ?? "—"}</TableCell>
                    <TableCell>{row?.fmb?.itsNo ?? "—"}</TableCell>
                    <TableCell>{row?.fmb?.name ?? "—"}</TableCell>
                    <TableCell>{row?.deliveryMohallah ?? "—"}</TableCell>
                    <TableCell>{tagsCell(row?.tags)}</TableCell>
                    <TableCell align="right">
                      <Button
                        label="Remove"
                        onClick={() =>
                          setPendingAssign((p) => {
                            const next = { ...p };
                            delete next[id];
                            return next;
                          })
                        }
                        disabled={busy}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          Assigned by thali type
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Totals across all thalis currently linked to this distributor.
        </Typography>
        {assignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Assign thalis above to see counts by type.
          </Typography>
        ) : (
          <TableContainer
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              maxWidth: { xs: "100%", sm: 440 },
            }}
          >
            <Table size="small" sx={{ minWidth: 280 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Thali type</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignedByThaliType.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">{row.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "medium" }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "medium" }}>
                    {assignments.length.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

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
          sx={{ flex: 1, maxWidth: { sm: 480 } }}
        >
          <MuiTextField
            size="small"
            fullWidth
            label="Filter assigned"
            placeholder="Thali no, ITS, name, mohallah, type, tags…"
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            disabled={busy}
          />
          <Button
            label="Unassign selected"
            onClick={() => void doBulkUnassign()}
            disabled={busy || selectedToUnassign.size === 0}
          />
        </Stack>
      </Stack>

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
          <Table size="small" sx={{ minWidth: 600 }}>
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
                <TableCell>Thali no.</TableCell>
                <TableCell>ITS</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Mohallah</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((a, index) => {
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
                          inputProps={{ "aria-label": `Select thali ${thali?.thaliNo ?? thaliId}` }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>{thali?.thaliNo ?? "—"}</TableCell>
                    <TableCell>{thali?.fmb?.itsNo ?? "—"}</TableCell>
                    <TableCell>{thali?.fmb?.name ?? "—"}</TableCell>
                    <TableCell>{thali?.deliveryMohallah ?? "—"}</TableCell>
                    <TableCell>
                      {thali?.thaliType?.name?.trim() || thali?.thaliType?.code?.trim() || "—"}
                    </TableCell>
                    <TableCell>{tagsCell(thali?.tags)}</TableCell>
                    <TableCell align="right">
                      <Button
                        label="Remove"
                        onClick={() => (thaliId ? void doUnassign(thaliId) : undefined)}
                        disabled={busy || !thaliId}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
