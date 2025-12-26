import React, { useCallback, useMemo } from "react";
import {
  TableRow,
  TableCell,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { ITS_COLUMNS, getOperatorsForType } from "./constants";

const FilterRule = React.memo(({ rule, onUpdate, onDelete }) => {
  const column = useMemo(
    () => ITS_COLUMNS.find((c) => c.id === rule.field) || ITS_COLUMNS[0],
    [rule.field]
  );

  const operators = useMemo(
    () => getOperatorsForType(column.type),
    [column.type]
  );

  const needsValue = useMemo(
    () => !["isEmpty", "isNotEmpty"].includes(rule.operator),
    [rule.operator]
  );

  const isMultiValue = useMemo(
    () => ["in", "notIn"].includes(rule.operator),
    [rule.operator]
  );

  const handleFieldChange = useCallback(
    (fieldId) => {
      const newColumn = ITS_COLUMNS.find((c) => c.id === fieldId);
      const newOperators = getOperatorsForType(newColumn.type);
      onUpdate({
        ...rule,
        field: fieldId,
        operator: newOperators[0].id,
        value: "",
      });
    },
    [rule, onUpdate]
  );

  const handleOperatorChange = useCallback(
    (operatorId) => {
      onUpdate({
        ...rule,
        operator: operatorId,
        value:
          operatorId === "isEmpty" || operatorId === "isNotEmpty"
            ? ""
            : rule.value,
      });
    },
    [rule, onUpdate]
  );

  const handleValueChange = useCallback(
    (newValue) => {
      onUpdate({
        ...rule,
        value: newValue,
      });
    },
    [rule, onUpdate]
  );

  return (
    <TableRow
      sx={{
        "&:hover": {
          bgcolor: "action.hover",
        },
        "&:last-child td": {
          borderBottom: 0,
        },
      }}
    >
      <TableCell sx={{ py: 0.5, width: "30%" }}>
        <FormControl size="small" fullWidth>
          <Select
            value={rule.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            displayEmpty
            sx={{
              fontSize: "0.8125rem",
              height: "32px",
              "& .MuiSelect-select": {
                py: 0.75,
                fontSize: "0.8125rem",
              },
            }}
          >
            {ITS_COLUMNS.map((col) => (
              <MenuItem
                key={col.id}
                value={col.id}
                sx={{ fontSize: "0.8125rem", py: 0.5 }}
              >
                {col.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell sx={{ py: 0.5, width: "25%" }}>
        <FormControl size="small" fullWidth>
          <Select
            value={rule.operator}
            onChange={(e) => handleOperatorChange(e.target.value)}
            displayEmpty
            sx={{
              fontSize: "0.8125rem",
              height: "32px",
              "& .MuiSelect-select": {
                py: 0.75,
                fontSize: "0.8125rem",
              },
            }}
          >
            {operators.map((op) => (
              <MenuItem
                key={op.id}
                value={op.id}
                sx={{ fontSize: "0.8125rem", py: 0.5 }}
              >
                {op.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell sx={{ py: 0.5, width: needsValue ? "40%" : "45%" }}>
        {needsValue ? (
          <TextField
            size="small"
            fullWidth
            placeholder={isMultiValue ? "val1, val2, ..." : "Enter value"}
            value={rule.value || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "0.8125rem",
                height: "32px",
              },
              "& .MuiInputBase-input": {
                py: 0.75,
                fontSize: "0.8125rem",
              },
            }}
          />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            No value needed
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ py: 0.5, width: "5%", textAlign: "center" }}>
        <IconButton
          color="error"
          size="small"
          onClick={onDelete}
          sx={{ width: 28, height: 28 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

FilterRule.displayName = "FilterRule";

export default FilterRule;
