import React from "react";
import { Box } from "@mui/material";
import { useFormContext, useWatch } from "react-hook-form";
import { useRecipientSelection } from "../context";
import AdvancedFilterBuilder from "./AdvancedFilterBuilder";

const RecipientFilters = () => {
  const { setValue, control } = useFormContext();
  const { updateSelectedPhones, updatePreviewStatus } = useRecipientSelection();

  // Watch form values using useWatch
  const filterCriteria = useWatch({ control, name: "filterCriteria" });

  return (
    <Box>
      <AdvancedFilterBuilder
        value={filterCriteria}
        onChange={(filterGroup) => {
          // Use setValue from useFormContext for form manipulation
          setValue("filterCriteria", filterGroup);
          // Reset preview status when filter changes (handled by context)
          updatePreviewStatus(false);
        }}
        onSelectionChange={updateSelectedPhones}
        onPreviewed={updatePreviewStatus}
      />
    </Box>
  );
};

export default RecipientFilters;
