import { useState, useMemo, useCallback, useEffect, memo, type ChangeEvent } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { ITS_COLUMNS, type FilterGroupData } from "./constants";
import { usePreviewRecipients } from "@/containers/whatsapp-broadcasts/components/hooks";
import type { RaRecord } from "react-admin";

type PreviewRow = RaRecord & Record<string, unknown>;

type RecipientsPreviewProps = {
  filterGroup: FilterGroupData;
  onPreviewCount?: (count: number) => void;
  onSelectionChange?: (
    recipients: { ITS_ID: string | null; phone: string; Full_Name: string | null }[]
  ) => void;
  onPreviewed?: (previewed: boolean) => void;
  skippedIdsMap: Map<string, Set<string>>;
  setSkippedIdsMap: (updater: (prev: Map<string, Set<string>>) => Map<string, Set<string>>) => void;
  shouldFetchMap: Map<string, boolean>;
  setShouldFetchMap: (updater: (prev: Map<string, boolean>) => Map<string, boolean>) => void;
};

const RecipientsPreview = memo(
  ({
    filterGroup,
    onPreviewCount,
    onSelectionChange,
    onPreviewed,
    skippedIdsMap,
    setSkippedIdsMap,
    shouldFetchMap,
    setShouldFetchMap,
  }: RecipientsPreviewProps) => {
    const [validationError, setValidationError] = useState<string | null>(null);

    const filterKey = useMemo(() => JSON.stringify(filterGroup), [filterGroup]);

    const skippedIds = useMemo(
      () => skippedIdsMap.get(filterKey) || new Set<string>(),
      [skippedIdsMap, filterKey]
    );

    const shouldFetch = useMemo(
      () => shouldFetchMap.get(filterKey) || false,
      [shouldFetchMap, filterKey]
    );

    const {
      data: previewData,
      isLoading,
      error: queryError,
    } = usePreviewRecipients({
      filterCriteria: filterGroup,
      limit: 10000,
      offset: 0,
      enabled: shouldFetch,
    });

    const allData = (previewData?.data as PreviewRow[] | undefined) || [];
    const total = previewData?.total || 0;
    const error = queryError as (Error & { body?: { message?: string } }) | null;

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    useEffect(() => {
      if (error) {
        onPreviewed?.(false);
      } else if (total !== undefined && !isLoading) {
        onPreviewCount?.(total);
        onPreviewed?.(true);
      }
    }, [total, isLoading, error, onPreviewCount, onPreviewed]);

    useEffect(() => {
      if (onSelectionChange && allData && Array.isArray(allData) && allData.length > 0) {
        const includedRecipients = allData.filter(
          (recipient) => recipient?.id != null && !skippedIds.has(String(recipient.id))
        );

        const selectedRecipients = includedRecipients
          .map((r) => {
            const phone = r.WhatsApp_No || r.Mobile;
            if (phone && String(phone).trim().length > 0) {
              return {
                ITS_ID: (r.ITS_ID as string | null) || null,
                phone: String(phone).trim(),
                Full_Name: (r.Full_Name as string | null) || null,
              };
            }
            return null;
          })
          .filter((r): r is NonNullable<typeof r> => r !== null);

        onSelectionChange(selectedRecipients);
      } else if (onSelectionChange && (!allData || allData.length === 0)) {
        onSelectionChange([]);
      }
    }, [allData, skippedIds, onSelectionChange]);

    const handleToggleSkip = useCallback(
      (id: string | number) => {
        const idStr = String(id);
        setSkippedIdsMap((prev) => {
          const newMap = new Map(prev);
          const currentSet = new Set(newMap.get(filterKey) || []);
          if (currentSet.has(idStr)) {
            currentSet.delete(idStr);
          } else {
            currentSet.add(idStr);
          }
          newMap.set(filterKey, currentSet);
          return newMap;
        });
      },
      [filterKey, setSkippedIdsMap]
    );

    const handlePreview = useCallback(() => {
      if (!filterGroup || (!filterGroup.rules?.length && !filterGroup.groups?.length)) {
        setValidationError("Please add at least one filter condition");
        return;
      }
      setValidationError(null);
      setShouldFetchMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(filterKey, true);
        return newMap;
      });
    }, [filterGroup, filterKey, setShouldFetchMap]);

    const getFieldLabel = useCallback((fieldId: string) => {
      const column = ITS_COLUMNS.find((c) => c.id === fieldId);
      return column ? column.label : fieldId;
    }, []);

    const fields = useMemo(() => {
      if (!allData || !Array.isArray(allData) || allData.length === 0) {
        return [];
      }

      const firstRecord = allData[0];
      if (!firstRecord || typeof firstRecord !== "object") return [];

      return Object.keys(firstRecord)
        .filter((key) => key !== "id")
        .sort();
    }, [allData]);

    const paginatedData = useMemo(() => {
      if (!allData || !Array.isArray(allData)) return [];
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      return allData.slice(start, end);
    }, [allData, page, rowsPerPage]);

    const handleChangePage = useCallback((_event: unknown, newPage: number) => {
      setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }, []);

    return (
      <Box>
        <Button variant="contained" onClick={handlePreview} disabled={shouldFetch} sx={{ mb: 2 }}>
          Preview Recipients
        </Button>

        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}

        {shouldFetch && (
          <Box sx={{ mt: 2 }}>
            {isLoading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Loading recipients...
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error?.body?.message || error?.message || "Failed to get recipient data"}
              </Alert>
            )}

            {!isLoading && !error && allData && allData.length > 0 && (
              <>
                <Alert severity="success" sx={{ mb: 2, py: 0.5 }}>
                  <Typography variant="body2" component="span" sx={{ fontWeight: "bold" }}>
                    {total - skippedIds.size}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    recipients included ({skippedIds.size} skipped)
                  </Typography>
                </Alert>
                <Card variant="outlined">
                  <TableContainer sx={{ maxHeight: "600px" }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {fields.map((field) => (
                            <TableCell key={field}>{getFieldLabel(field)}</TableCell>
                          ))}
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((record) => {
                          const rid = record.id != null ? String(record.id) : "";
                          const isSkipped = skippedIds.has(rid);
                          return (
                            <TableRow
                              key={rid}
                              sx={{
                                backgroundColor: isSkipped ? "#ffebee" : "inherit",
                                "&:hover": {
                                  backgroundColor: isSkipped ? "#ffcdd2" : "action.hover",
                                },
                              }}
                            >
                              {fields.map((field) => (
                                <TableCell key={field}>{String(record[field] ?? "-")}</TableCell>
                              ))}
                              <TableCell>
                                <Button
                                  size="small"
                                  variant={isSkipped ? "outlined" : "text"}
                                  color={isSkipped ? "error" : "primary"}
                                  onClick={() => handleToggleSkip(record.id as string | number)}
                                  sx={{ minWidth: "80px" }}
                                >
                                  {isSkipped ? "Include" : "Skip"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={allData.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                  />
                </Card>
              </>
            )}

            {!isLoading && !error && (!allData || allData.length === 0) && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No recipients found matching the criteria
              </Alert>
            )}
          </Box>
        )}
      </Box>
    );
  }
);

RecipientsPreview.displayName = "RecipientsPreview";

export default RecipientsPreview;
