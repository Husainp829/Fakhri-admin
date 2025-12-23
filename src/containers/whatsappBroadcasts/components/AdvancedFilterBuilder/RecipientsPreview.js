import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { ITS_COLUMNS } from "./constants";
import { usePreviewRecipients } from "../hooks";

const RecipientsPreview = React.memo(
  ({
    filterGroup,
    onPreviewCount,
    onSelectionChange,
    onPreviewed,
    skippedIdsMap,
    setSkippedIdsMap,
    shouldFetchMap,
    setShouldFetchMap,
  }) => {
    const [validationError, setValidationError] = useState(null);

    // Get or create skippedIds for current filterGroup
    const filterKey = useMemo(() => JSON.stringify(filterGroup), [filterGroup]);

    const skippedIds = useMemo(
      () => skippedIdsMap.get(filterKey) || new Set(),
      [skippedIdsMap, filterKey]
    );

    // Get or restore shouldFetch state for current filterGroup
    const shouldFetch = useMemo(
      () => shouldFetchMap.get(filterKey) || false,
      [shouldFetchMap, filterKey]
    );

    // Fetch ALL data for phone number extraction and display
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

    // Extract data from previewData
    const allData = previewData?.data || [];
    const total = previewData?.total || 0;
    const error = queryError;

    // Pagination state for display
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Notify parent of preview count and status when data changes
    useEffect(() => {
      if (error) {
        onPreviewed?.(false);
      } else if (total !== undefined && !isLoading) {
        onPreviewCount?.(total);
        onPreviewed?.(true);
      }
    }, [total, isLoading, error, onPreviewCount, onPreviewed]);

    // Extract recipient data from ALL data (not just current page)
    // Pass full recipient objects with ITS_ID and phone for accurate lookup
    useEffect(() => {
      if (
        onSelectionChange &&
        allData &&
        Array.isArray(allData) &&
        allData.length > 0
      ) {
        // Filter out skipped IDs from all data
        const includedRecipients = allData.filter(
          (recipient) => recipient?.id && !skippedIds.has(recipient.id)
        );

        // Extract recipient objects with ITS_ID and phone - prioritize WhatsApp_No over Mobile
        const selectedRecipients = includedRecipients
          .map((r) => {
            const phone = r.WhatsApp_No || r.Mobile;
            if (phone && String(phone).trim().length > 0) {
              return {
                ITS_ID: r.ITS_ID || null,
                phone: String(phone).trim(),
                Full_Name: r.Full_Name || null,
              };
            }
            return null;
          })
          .filter((r) => r !== null);

        onSelectionChange(selectedRecipients);
      } else if (onSelectionChange && (!allData || allData.length === 0)) {
        onSelectionChange([]);
      }
    }, [allData, skippedIds, onSelectionChange]);

    // Handle skip/include toggle
    const handleToggleSkip = useCallback(
      (id) => {
        setSkippedIdsMap((prev) => {
          const newMap = new Map(prev);
          const currentSet = new Set(newMap.get(filterKey) || []);
          if (currentSet.has(id)) {
            currentSet.delete(id);
          } else {
            currentSet.add(id);
          }
          newMap.set(filterKey, currentSet);
          return newMap;
        });
      },
      [filterKey]
    );

    const handlePreview = useCallback(() => {
      if (
        !filterGroup ||
        (!filterGroup.rules?.length && !filterGroup.groups?.length)
      ) {
        setValidationError("Please add at least one filter condition");
        return;
      }
      setValidationError(null);
      setShouldFetchMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(filterKey, true);
        return newMap;
      });
    }, [filterGroup, filterKey]);

    // Get field labels for display
    const getFieldLabel = useCallback((fieldId) => {
      const column = ITS_COLUMNS.find((c) => c.id === fieldId);
      return column ? column.label : fieldId;
    }, []);

    // Derive fields from the data - optimize by checking first record only
    const fields = useMemo(() => {
      if (!allData || !Array.isArray(allData) || allData.length === 0) {
        return [];
      }

      // Use first record to get field structure (more efficient)
      const firstRecord = allData[0];
      if (!firstRecord || typeof firstRecord !== "object") return [];

      // Get all keys from first record, excluding 'id'
      return Object.keys(firstRecord)
        .filter((key) => key !== "id")
        .sort();
    }, [allData]);

    // Get paginated data for display
    const paginatedData = useMemo(() => {
      if (!allData || !Array.isArray(allData)) return [];
      const start = page * rowsPerPage;
      const end = start + rowsPerPage;
      return allData.slice(start, end);
    }, [allData, page, rowsPerPage]);

    const handleChangePage = useCallback((event, newPage) => {
      setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }, []);

    return (
      <Box>
        <Button
          variant="contained"
          onClick={handlePreview}
          disabled={shouldFetch}
          sx={{ mb: 2 }}
        >
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
                {error?.body?.message ||
                  error?.message ||
                  "Failed to get recipient data"}
              </Alert>
            )}

            {!isLoading && !error && allData && allData.length > 0 && (
              <>
                <Alert severity="success" sx={{ mb: 2, py: 0.5 }}>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ fontWeight: "bold" }}
                  >
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
                            <TableCell key={field}>
                              {getFieldLabel(field)}
                            </TableCell>
                          ))}
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedData.map((record) => {
                          const isSkipped = skippedIds.has(record.id);
                          return (
                            <TableRow
                              key={record.id}
                              sx={{
                                backgroundColor: isSkipped
                                  ? "#ffebee"
                                  : "inherit",
                                "&:hover": {
                                  backgroundColor: isSkipped
                                    ? "#ffcdd2"
                                    : "action.hover",
                                },
                              }}
                            >
                              {fields.map((field) => (
                                <TableCell key={field}>
                                  {record[field] || "-"}
                                </TableCell>
                              ))}
                              <TableCell>
                                <Button
                                  size="small"
                                  variant={isSkipped ? "outlined" : "text"}
                                  color={isSkipped ? "error" : "primary"}
                                  onClick={() => handleToggleSkip(record.id)}
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
