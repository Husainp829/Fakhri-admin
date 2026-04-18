import { useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { AssignmentRow } from "./assignedThalisUtils";
import { buildAssignedThaliTypeBreakdown } from "./assignedThalisUtils";

type Props = {
  assignments: AssignmentRow[];
};

export default function AssignedThaliTypeBreakdown({ assignments }: Props) {
  const assignedByThaliType = useMemo(
    () => buildAssignedThaliTypeBreakdown(assignments),
    [assignments]
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        Assigned by thali type
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Totals across all thalis currently linked to this distributor.
      </Typography>
      {assignments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Use <strong>Add thalis</strong> to search and assign; counts by type appear here.
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
  );
}
