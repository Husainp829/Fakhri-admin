import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, Alert, Card, CardContent } from "@mui/material";
import FilterGroup from "./FilterGroup";
import RecipientsPreview from "./RecipientsPreview";
import { ITS_COLUMNS } from "./constants";

const AdvancedFilterBuilder = React.memo(
  ({ value, onChange, onPreviewCount, onSelectionChange, onPreviewed }) => {
    // Initialize with empty group if no value
    const getDefaultGroup = useCallback(
      () => ({
        id: "root",
        logic: "AND",
        rules: [],
        groups: [],
      }),
      []
    );

    // Use local state that syncs with prop value
    const [filterGroup, setFilterGroup] = useState(value || getDefaultGroup());

    // Use refs to persist state across child component unmounts
    // Refs persist across re-renders and remounts of this component
    const skippedIdsMapRef = useRef(new Map());
    const shouldFetchMapRef = useRef(new Map());

    // Create state that syncs with refs for reactivity
    const [skippedIdsMap, setSkippedIdsMap] = useState(
      skippedIdsMapRef.current
    );
    const [shouldFetchMap, setShouldFetchMap] = useState(
      shouldFetchMapRef.current
    );

    // Wrapper functions that update both ref and state
    const updateSkippedIdsMap = useCallback((updater) => {
      setSkippedIdsMap((prev) => {
        const newMap = updater(prev);
        skippedIdsMapRef.current = newMap;
        return newMap;
      });
    }, []);

    const updateShouldFetchMap = useCallback((updater) => {
      setShouldFetchMap((prev) => {
        const newMap = updater(prev);
        shouldFetchMapRef.current = newMap;
        return newMap;
      });
    }, []);

    // Sync local state when prop value changes
    useEffect(() => {
      if (value) {
        setFilterGroup(value);
      } else {
        setFilterGroup(getDefaultGroup());
      }
    }, [value, getDefaultGroup]);

    const handleFilterChange = useCallback(
      (updatedGroup) => {
        setFilterGroup(updatedGroup);
        if (onChange) {
          onChange(updatedGroup);
        }
      },
      [onChange]
    );

    const handleReset = useCallback(() => {
      handleFilterChange({
        id: "root",
        logic: "AND",
        rules: [],
        groups: [],
      });
    }, [handleFilterChange]);

    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Advanced Recipient Filter Builder
        </Typography>
        <Alert severity="info" sx={{ mb: 1.5, py: 0.75 }}>
          Build complex filters using AND/OR logic. You can nest groups and
          combine multiple conditions to precisely target your recipients.
        </Alert>

        <FilterGroup
          group={filterGroup}
          onUpdate={handleFilterChange}
          onDelete={handleReset}
          level={0}
          availableColumns={ITS_COLUMNS}
        />

        <Card sx={{ mt: 2 }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview Recipients
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1.5, display: "block" }}
            >
              Test your filters to see recipients that match your criteria
            </Typography>
            <RecipientsPreview
              filterGroup={filterGroup}
              onPreviewCount={onPreviewCount}
              onSelectionChange={onSelectionChange}
              onPreviewed={onPreviewed}
              skippedIdsMap={skippedIdsMap}
              setSkippedIdsMap={updateSkippedIdsMap}
              shouldFetchMap={shouldFetchMap}
              setShouldFetchMap={updateShouldFetchMap}
            />
          </CardContent>
        </Card>
      </Box>
    );
  }
);

AdvancedFilterBuilder.displayName = "AdvancedFilterBuilder";

export default AdvancedFilterBuilder;
