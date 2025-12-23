import React, { useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  GroupAdd as GroupAddIcon,
} from "@mui/icons-material";
import FilterRule from "./FilterRule";
import { ITS_COLUMNS } from "./constants";

const FilterGroup = React.memo(
  ({ group, onUpdate, onDelete, level = 0, availableColumns }) => {
    const addRule = useCallback(() => {
      const newRule = {
        id: `rule_${Date.now()}_${Math.random()}`,
        field: ITS_COLUMNS[0].id,
        operator: "equals",
        value: "",
      };
      onUpdate({
        ...group,
        rules: [...(group.rules || []), newRule],
      });
    }, [group, onUpdate]);

    const addNestedGroup = useCallback(() => {
      const newGroup = {
        id: `group_${Date.now()}_${Math.random()}`,
        logic: "AND",
        rules: [],
        groups: [],
      };
      onUpdate({
        ...group,
        groups: [...(group.groups || []), newGroup],
      });
    }, [group, onUpdate]);

    const updateRule = useCallback(
      (ruleId, updatedRule) => {
        onUpdate({
          ...group,
          rules: (group.rules || []).map((r) =>
            r.id === ruleId ? updatedRule : r
          ),
        });
      },
      [group, onUpdate]
    );

    const deleteRule = useCallback(
      (ruleId) => {
        onUpdate({
          ...group,
          rules: (group.rules || []).filter((r) => r.id !== ruleId),
        });
      },
      [group, onUpdate]
    );

    const updateNestedGroup = useCallback(
      (groupId, updatedGroup) => {
        onUpdate({
          ...group,
          groups: (group.groups || []).map((g) =>
            g.id === groupId ? updatedGroup : g
          ),
        });
      },
      [group, onUpdate]
    );

    const deleteNestedGroup = useCallback(
      (groupId) => {
        onUpdate({
          ...group,
          groups: (group.groups || []).filter((g) => g.id !== groupId),
        });
      },
      [group, onUpdate]
    );

    const toggleLogic = useCallback(() => {
      onUpdate({
        ...group,
        logic: group.logic === "AND" ? "OR" : "AND",
      });
    }, [group, onUpdate]);

    return (
      <Paper
        elevation={level === 0 ? 2 : 1}
        sx={{
          p: 1.5,
          mb: 1.5,
          border: level === 0 ? "2px solid" : "1px solid",
          borderColor: level === 0 ? "primary.main" : "divider",
          borderRadius: 1,
          bgcolor: level === 0 ? "action.hover" : "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
          <Chip
            label={group.logic}
            onClick={toggleLogic}
            color={group.logic === "AND" ? "primary" : "secondary"}
            size="small"
            sx={{ cursor: "pointer", fontWeight: "bold", height: 28 }}
          />
          <Typography variant="caption" color="text.secondary">
            {group.logic === "AND"
              ? "All conditions must match"
              : "Any condition can match"}
          </Typography>
          {level > 0 && (
            <IconButton
              color="error"
              size="small"
              onClick={onDelete}
              sx={{ ml: "auto", width: 28, height: 28 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Rules Table */}
        {group.rules && group.rules.length > 0 && (
          <TableContainer sx={{ mb: 1.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ py: 0.5, fontWeight: "bold", fontSize: "0.75rem" }}
                  >
                    Field
                  </TableCell>
                  <TableCell
                    sx={{ py: 0.5, fontWeight: "bold", fontSize: "0.75rem" }}
                  >
                    Operator
                  </TableCell>
                  <TableCell
                    sx={{ py: 0.5, fontWeight: "bold", fontSize: "0.75rem" }}
                  >
                    Value
                  </TableCell>
                  <TableCell
                    sx={{ py: 0.5, width: 60, textAlign: "center" }}
                  ></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.rules.map((rule) => (
                  <FilterRule
                    key={rule.id}
                    rule={rule}
                    onUpdate={(updated) => updateRule(rule.id, updated)}
                    onDelete={() => deleteRule(rule.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Nested Groups */}
        {group.groups && group.groups.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {group.groups.map((nestedGroup) => (
              <Box key={nestedGroup.id} sx={{ ml: level > 0 ? 1 : 0, mt: 1 }}>
                <FilterGroup
                  group={nestedGroup}
                  onUpdate={(updated) =>
                    updateNestedGroup(nestedGroup.id, updated)
                  }
                  onDelete={() => deleteNestedGroup(nestedGroup.id)}
                  level={level + 1}
                  availableColumns={availableColumns}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Add buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addRule}
            sx={{ fontSize: "0.8125rem" }}
          >
            Add Condition
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<GroupAddIcon />}
            onClick={addNestedGroup}
            sx={{ fontSize: "0.8125rem" }}
          >
            Add Group
          </Button>
        </Stack>
      </Paper>
    );
  }
);

FilterGroup.displayName = "FilterGroup";

export default FilterGroup;
