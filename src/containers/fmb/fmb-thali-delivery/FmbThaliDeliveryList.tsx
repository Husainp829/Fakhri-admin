import React from "react";
import { Box } from "@mui/material";
import { Title, type ListProps } from "react-admin";
import DailySummarySection from "./DailySummarySection";

/** Daily summary only; pause/resume lives on each FMB household Delivery tab. */
export default function FmbThaliDeliveryList(_props: ListProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Title title="Thali delivery" />
      <DailySummarySection />
    </Box>
  );
}
