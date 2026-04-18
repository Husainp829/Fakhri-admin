import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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
} from "react-admin";
import type { ListControllerResult } from "ra-core";
import {
  Autocomplete,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_SEARCH_ROWS_PER_PAGE = 25;
const SEARCH_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

/** Thali row as a react-admin record (Datagrid / fields). */
const THALI_SEARCH_RESOURCE = "fmbData";

export interface FmbThaliRow {
  id?: string;
  thaliNo?: string;
  deliveryAddress?: string | null;
  deliveryMohallah?: string | null;
  thaliType?: { id?: string; name?: string | null; code?: string | null } | null;
  fmb?: { itsNo?: string; name?: string };
  /** Serialized from API (`fmbThaliTag` rows). */
  tags?: string[];
}

type ThaliSearchRecord = FmbThaliRow & RaRecord;

export function tagsCell(tags: string[] | undefined) {
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

export type AddThalisDialogProps = {
  open: boolean;
  onClose: () => void;
  distributorId: string | number | undefined;
  /** Thalis already linked to this distributor (and elsewhere) — disables queue/select. */
  assignedThaliIdSet: Set<string>;
  /** Parent loading / mutating assignments (disables dialog actions). */
  busy: boolean;
  onAssignSuccess: () => Promise<void>;
  onReloadAssignments: () => Promise<void>;
  onPendingQueueChange?: (count: number) => void;
};

export default function AddThalisDialog({
  open,
  onClose,
  distributorId,
  assignedThaliIdSet,
  busy,
  onAssignSuccess,
  onReloadAssignments,
  onPendingQueueChange,
}: AddThalisDialogProps) {
  const notify = useNotify();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tagFilterInput, setTagFilterInput] = useState<string[]>([]);
  const [debouncedTagFilter, setDebouncedTagFilter] = useState<string[]>([]);
  const [tagSuggestOptions, setTagSuggestOptions] = useState<string[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [thaliSearchResults, setThaliSearchResults] = useState<FmbThaliRow[]>([]);
  const [thaliSearchTotal, setThaliSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(0);
  const [searchRowsPerPage, setSearchRowsPerPage] = useState(DEFAULT_SEARCH_ROWS_PER_PAGE);
  const [pendingAssign, setPendingAssign] = useState<Record<string, FmbThaliRow>>({});

  const disabled = busy || assignSubmitting;

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
    if (!open) return;
    void fetchThalis({
      search: debouncedSearch,
      tags: debouncedTagFilter,
      page: searchPage,
      pageSize: searchRowsPerPage,
    });
  }, [
    open,
    debouncedSearch,
    debouncedTagsSignature,
    searchPage,
    searchRowsPerPage,
    fetchThalis,
    debouncedTagFilter,
  ]);

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
    debouncedTagFilter,
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

  const pendingAssignList = useMemo(
    () => Object.entries(pendingAssign).map(([id, row]) => ({ id, row })),
    [pendingAssign]
  );

  useEffect(() => {
    onPendingQueueChange?.(pendingAssignList.length);
  }, [pendingAssignList.length, onPendingQueueChange]);

  const doAssign = async () => {
    const ids = Object.keys(pendingAssign);
    if (!ids.length) {
      notify("Select thalis in the search results or queue below, then assign", {
        type: "warning",
      });
      return;
    }
    if (!distributorId) return;
    setAssignSubmitting(true);
    try {
      await httpClient(`${getApiUrl()}/fmbThaliDistribution/assign`, {
        method: "POST",
        body: JSON.stringify({ distributorId, fmbThaliIds: ids }),
      });
      notify(`Assigned ${ids.length} thali(s)`, { type: "info" });
      setPendingAssign({});
      onClose();
      await onAssignSuccess();
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "Assign failed", { type: "error" });
    } finally {
      setAssignSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" scroll="paper">
      <DialogTitle>Add thalis</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Search thalis (and optionally restrict by tags — a thali matches if it has{" "}
          <strong>any</strong> of the selected tags), use the datagrid checkboxes to queue rows,
          then assign in one go. The queue is kept when you change search, tag filter, or page. Each
          thali can only be on one distributor at a time.
        </Typography>

        <Stack spacing={2}>
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
                  disabled={disabled}
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
                      disabled={disabled}
                    />
                  )}
                />
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Button
                    label="Clear search"
                    onClick={() => setSearchInput("")}
                    disabled={disabled}
                  />
                  <Button
                    label="Clear tags"
                    onClick={() => {
                      setTagFilterInput([]);
                      setDebouncedTagFilter([]);
                    }}
                    disabled={disabled || tagFilterInput.length === 0}
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
                          {assignedThaliIdSet.has(String(r.id))
                            ? "Already on this distributor"
                            : ""}
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
              disabled={disabled || pendingAssignList.length === 0}
            />
            <Button
              label="Clear queue"
              onClick={clearPendingAssign}
              disabled={disabled || pendingAssignList.length === 0}
            />
            <Button
              label="Refresh assignments"
              onClick={() => void onReloadAssignments()}
              disabled={disabled}
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
                          disabled={disabled}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button label="Close" onClick={onClose} disabled={disabled} />
      </DialogActions>
    </Dialog>
  );
}
