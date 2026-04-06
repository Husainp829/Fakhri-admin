import { useState, useEffect, useCallback, useRef, memo } from "react";
import { Box, Typography, Alert, Card, CardContent } from "@mui/material";
import FilterGroup from "./FilterGroup";
import RecipientsPreview from "./RecipientsPreview";
import { ITS_COLUMNS, type FilterGroupData } from "./constants";

type AdvancedFilterBuilderProps = {
  value: FilterGroupData | undefined | null;
  onChange?: (group: FilterGroupData) => void;
  onPreviewCount?: (count: number) => void;
  onSelectionChange?: (
    recipients: { ITS_ID: string | null; phone: string; Full_Name: string | null }[]
  ) => void;
  onPreviewed?: (previewed: boolean) => void;
};

const AdvancedFilterBuilder = memo(
  ({
    value,
    onChange,
    onPreviewCount,
    onSelectionChange,
    onPreviewed,
  }: AdvancedFilterBuilderProps) => {
    const getDefaultGroup = useCallback(
      (): FilterGroupData => ({
        id: "root",
        logic: "AND",
        rules: [],
        groups: [],
      }),
      []
    );

    const [filterGroup, setFilterGroup] = useState<FilterGroupData>(value || getDefaultGroup());

    const skippedIdsMapRef = useRef(new Map<string, Set<string>>());
    const shouldFetchMapRef = useRef(new Map<string, boolean>());

    const [skippedIdsMap, setSkippedIdsMap] = useState(skippedIdsMapRef.current);
    const [shouldFetchMap, setShouldFetchMap] = useState(shouldFetchMapRef.current);

    const updateSkippedIdsMap = useCallback(
      (updater: (prev: Map<string, Set<string>>) => Map<string, Set<string>>) => {
        setSkippedIdsMap((prev) => {
          const newMap = updater(prev);
          skippedIdsMapRef.current = newMap;
          return newMap;
        });
      },
      []
    );

    const updateShouldFetchMap = useCallback(
      (updater: (prev: Map<string, boolean>) => Map<string, boolean>) => {
        setShouldFetchMap((prev) => {
          const newMap = updater(prev);
          shouldFetchMapRef.current = newMap;
          return newMap;
        });
      },
      []
    );

    useEffect(() => {
      if (value) {
        setFilterGroup(value);
      } else {
        setFilterGroup(getDefaultGroup());
      }
    }, [value, getDefaultGroup]);

    const handleFilterChange = useCallback(
      (updatedGroup: FilterGroupData) => {
        setFilterGroup(updatedGroup);
        onChange?.(updatedGroup);
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
          Build complex filters using AND/OR logic. You can nest groups and combine multiple
          conditions to precisely target your recipients.
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
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
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
