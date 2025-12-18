import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Select,
  MenuItem,
  TextField,
  FormControl,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
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
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { getApiUrl } from "../../constants";
import httpClient from "../../dataprovider/httpClient";

// ITS Data columns - all filterable fields
const ITS_COLUMNS = [
  { id: "ITS_ID", label: "ITS ID", type: "string" },
  { id: "HOF_FM_TYPE", label: "HOF/FM Type", type: "string" },
  { id: "HOF_ID", label: "HOF ID", type: "string" },
  { id: "Family_ID", label: "Family ID", type: "string" },
  { id: "Father_ITS_ID", label: "Father ITS ID", type: "string" },
  { id: "Mother_ITS_ID", label: "Mother ITS ID", type: "string" },
  { id: "Spouse_ITS_ID", label: "Spouse ITS ID", type: "string" },
  { id: "TanzeemFile_No", label: "Tanzeem File No", type: "string" },
  { id: "Full_Name", label: "Full Name", type: "string" },
  { id: "Full_Name_Arabic", label: "Full Name (Arabic)", type: "string" },
  { id: "First_Prefix", label: "First Prefix", type: "string" },
  { id: "Prefix_Year", label: "Prefix Year", type: "string" },
  { id: "First_Name", label: "First Name", type: "string" },
  { id: "Father_Prefix", label: "Father Prefix", type: "string" },
  { id: "Father_Name", label: "Father Name", type: "string" },
  { id: "Father_Surname", label: "Father Surname", type: "string" },
  { id: "Husband_Prefix", label: "Husband Prefix", type: "string" },
  { id: "Husband_Name", label: "Husband Name", type: "string" },
  { id: "Surname", label: "Surname", type: "string" },
  { id: "Age", label: "Age", type: "number" },
  { id: "Gender", label: "Gender", type: "string" },
  { id: "Misaq", label: "Misaq", type: "string" },
  { id: "Marital_Status", label: "Marital Status", type: "string" },
  { id: "Blood_Group", label: "Blood Group", type: "string" },
  { id: "Warakatul_Tarkhis", label: "Warakatul Tarkhis", type: "string" },
  { id: "Date_Of_Nikah", label: "Date of Nikah", type: "string" },
  { id: "Date_Of_Nikah_Hijri", label: "Date of Nikah (Hijri)", type: "string" },
  { id: "Mobile", label: "Mobile", type: "string" },
  { id: "Email", label: "Email", type: "string" },
  { id: "Title", label: "Title", type: "string" },
  { id: "Category", label: "Category", type: "string" },
  { id: "Idara", label: "Idara", type: "string" },
  { id: "Organisation", label: "Organisation", type: "string" },
  { id: "Organisation_CSV", label: "Organisation CSV", type: "string" },
  { id: "Vatan", label: "Vatan", type: "string" },
  { id: "Nationality", label: "Nationality", type: "string" },
  { id: "Jamaat", label: "Jamaat", type: "string" },
  { id: "Jamiaat", label: "Jamiaat", type: "string" },
  { id: "Qualification", label: "Qualification", type: "string" },
  { id: "Languages", label: "Languages", type: "string" },
  { id: "Hunars", label: "Hunars", type: "string" },
  { id: "Occupation", label: "Occupation", type: "string" },
  { id: "Sub_Occupation", label: "Sub Occupation", type: "string" },
  { id: "Sub_Occupation2", label: "Sub Occupation 2", type: "string" },
  { id: "Quran_Sanad", label: "Quran Sanad", type: "string" },
  { id: "Qadambosi_Sharaf", label: "Qadambosi Sharaf", type: "string" },
  {
    id: "Raudat_Tahera_Ziyarat",
    label: "Raudat Tahera Ziyarat",
    type: "string",
  },
  { id: "Karbala_Ziyarat", label: "Karbala Ziyarat", type: "string" },
  { id: "Ashara_Mubaraka", label: "Ashara Mubaraka", type: "number" },
  { id: "Housing", label: "Housing", type: "string" },
  { id: "Type_of_House", label: "Type of House", type: "string" },
  { id: "Address", label: "Address", type: "string" },
  { id: "Building", label: "Building", type: "string" },
  { id: "Street", label: "Street", type: "string" },
  { id: "Area", label: "Area", type: "string" },
  { id: "State", label: "State", type: "string" },
  { id: "City", label: "City", type: "string" },
  { id: "Pincode", label: "Pincode", type: "string" },
  { id: "Sector", label: "Sector", type: "string" },
  { id: "Sub_Sector", label: "Sub Sector", type: "string" },
  { id: "Inactive_Status", label: "Inactive Status", type: "string" },
  {
    id: "Data_Verifcation_Status",
    label: "Data Verification Status",
    type: "string",
  },
  {
    id: "Data_Verification_Date",
    label: "Data Verification Date",
    type: "string",
  },
  {
    id: "Photo_Verifcation_Status",
    label: "Photo Verification Status",
    type: "string",
  },
  {
    id: "Photo_Verification_Date",
    label: "Photo Verification Date",
    type: "string",
  },
  { id: "Last_Scanned_Event", label: "Last Scanned Event", type: "string" },
  { id: "Last_Scanned_Place", label: "Last Scanned Place", type: "string" },
  {
    id: "Sector_Incharge_ITSID",
    label: "Sector Incharge ITS ID",
    type: "string",
  },
  { id: "Sector_Incharge_Name", label: "Sector Incharge Name", type: "string" },
  {
    id: "Sector_Incharge_Female_ITSID",
    label: "Sector Incharge Female ITS ID",
    type: "string",
  },
  {
    id: "Sector_Incharge_Female_Name",
    label: "Sector Incharge Female Name",
    type: "string",
  },
  {
    id: "Sub_Sector_Incharge_ITSID",
    label: "Sub Sector Incharge ITS ID",
    type: "string",
  },
  {
    id: "Sub_Sector_Incharge_Name",
    label: "Sub Sector Incharge Name",
    type: "string",
  },
  {
    id: "Sub_Sector_Incharge_Female_ITSID",
    label: "Sub Sector Incharge Female ITS ID",
    type: "string",
  },
  {
    id: "Sub_Sector_Incharge_Female_Name",
    label: "Sub Sector Incharge Female Name",
    type: "string",
  },
];

// Operators based on field type
const STRING_OPERATORS = [
  { id: "equals", label: "Equals" },
  { id: "notEquals", label: "Not Equals" },
  { id: "contains", label: "Contains" },
  { id: "notContains", label: "Not Contains" },
  { id: "startsWith", label: "Starts With" },
  { id: "endsWith", label: "Ends With" },
  { id: "in", label: "In (multiple values)" },
  { id: "notIn", label: "Not In (multiple values)" },
  { id: "isEmpty", label: "Is Empty" },
  { id: "isNotEmpty", label: "Is Not Empty" },
];

const NUMBER_OPERATORS = [
  { id: "equals", label: "Equals" },
  { id: "notEquals", label: "Not Equals" },
  { id: "greaterThan", label: "Greater Than" },
  { id: "greaterThanOrEqual", label: "Greater Than Or Equal" },
  { id: "lessThan", label: "Less Than" },
  { id: "lessThanOrEqual", label: "Less Than Or Equal" },
  { id: "in", label: "In (multiple values)" },
  { id: "notIn", label: "Not In (multiple values)" },
  { id: "isEmpty", label: "Is Empty" },
  { id: "isNotEmpty", label: "Is Not Empty" },
];

const getOperatorsForType = (type) =>
  type === "number" ? NUMBER_OPERATORS : STRING_OPERATORS;

// Filter rule component - Table row version
const FilterRule = ({ rule, onUpdate, onDelete }) => {
  const column = ITS_COLUMNS.find((c) => c.id === rule.field) || ITS_COLUMNS[0];
  const operators = getOperatorsForType(column.type);

  const handleFieldChange = (fieldId) => {
    const newColumn = ITS_COLUMNS.find((c) => c.id === fieldId);
    const newOperators = getOperatorsForType(newColumn.type);
    onUpdate({
      ...rule,
      field: fieldId,
      operator: newOperators[0].id,
      value: "",
    });
  };

  const handleOperatorChange = (operatorId) => {
    onUpdate({
      ...rule,
      operator: operatorId,
      value:
        operatorId === "isEmpty" || operatorId === "isNotEmpty"
          ? ""
          : rule.value,
    });
  };

  const handleValueChange = (newValue) => {
    onUpdate({
      ...rule,
      value: newValue,
    });
  };

  const needsValue = !["isEmpty", "isNotEmpty"].includes(rule.operator);
  const isMultiValue = ["in", "notIn"].includes(rule.operator);

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
};

// Filter group component
const FilterGroup = ({
  group,
  onUpdate,
  onDelete,
  level = 0,
  availableColumns,
}) => {
  const addRule = () => {
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
  };

  const addNestedGroup = () => {
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
  };

  const updateRule = (ruleId, updatedRule) => {
    onUpdate({
      ...group,
      rules: (group.rules || []).map((r) =>
        r.id === ruleId ? updatedRule : r
      ),
    });
  };

  const deleteRule = (ruleId) => {
    onUpdate({
      ...group,
      rules: (group.rules || []).filter((r) => r.id !== ruleId),
    });
  };

  const updateNestedGroup = (groupId, updatedGroup) => {
    onUpdate({
      ...group,
      groups: (group.groups || []).map((g) =>
        g.id === groupId ? updatedGroup : g
      ),
    });
  };

  const deleteNestedGroup = (groupId) => {
    onUpdate({
      ...group,
      groups: (group.groups || []).filter((g) => g.id !== groupId),
    });
  };

  const toggleLogic = () => {
    onUpdate({
      ...group,
      logic: group.logic === "AND" ? "OR" : "AND",
    });
  };

  return (
    <Paper
      elevation={level === 0 ? 2 : 1}
      sx={{
        p: 1.5,
        mb: 1.5,
        border: level === 0 ? "2px solid" : "1px solid",
        borderColor: level === 0 ? "primary.main" : "divider",
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
};

// Main Advanced Filter Builder Component
const AdvancedFilterBuilder = ({ value, onChange, onPreviewCount }) => {
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  // Initialize with empty group if no value
  const getDefaultGroup = () => ({
    id: "root",
    logic: "AND",
    rules: [],
    groups: [],
  });

  // Use local state that syncs with prop value
  const [filterGroup, setFilterGroup] = useState(value || getDefaultGroup());

  // Sync local state when prop value changes
  useEffect(() => {
    if (value) {
      setFilterGroup(value);
    } else {
      setFilterGroup(getDefaultGroup());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFilterChange = (updatedGroup) => {
    setFilterGroup(updatedGroup);
    if (onChange) {
      onChange(updatedGroup);
    }
  };

  // Extract all fields from filter conditions
  const extractFieldsFromGroup = (group) => {
    const fields = new Set();

    if (group.rules) {
      group.rules.forEach((rule) => {
        if (rule.field) {
          fields.add(rule.field);
        }
      });
    }

    if (group.groups) {
      group.groups.forEach((nestedGroup) => {
        const nestedFields = extractFieldsFromGroup(nestedGroup);
        nestedFields.forEach((field) => fields.add(field));
      });
    }

    return fields;
  };

  const getSelectedFields = () => {
    const fields = extractFieldsFromGroup(filterGroup);
    // Always include ITS_ID and Full_Name
    fields.add("ITS_ID");
    fields.add("Full_Name");
    return Array.from(fields);
  };

  const getFieldLabel = (fieldId) => {
    const column = ITS_COLUMNS.find((c) => c.id === fieldId);
    return column ? column.label : fieldId;
  };

  const handleOpenInNewTab = () => {
    // Encode filter criteria as base64 to pass in URL
    const filterCriteriaJson = JSON.stringify(filterGroup);
    const encodedFilters = btoa(encodeURIComponent(filterCriteriaJson));
    const url = `#/itsdata?filterCriteria=${encodedFilters}`;
    window.open(url, "_blank");
  };

  const handlePreviewCount = async () => {
    if (
      !filterGroup ||
      (!filterGroup.rules?.length && !filterGroup.groups?.length)
    ) {
      setPreviewError("Please add at least one filter condition");
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      // Call API to get count
      const url = `${getApiUrl(
        "whatsappBroadcasts"
      )}/whatsappBroadcasts/preview-recipients`;
      const { json } = await httpClient(url, {
        method: "POST",
        body: JSON.stringify({ filterCriteria: filterGroup }),
      });

      setPreviewCount(json.count);
      if (onPreviewCount) {
        onPreviewCount(json.count);
      }
    } catch (error) {
      setPreviewError(error.message || "Failed to get recipient count");
      setPreviewCount(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Advanced Recipient Filter Builder
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Build complex filters using AND/OR logic. You can nest groups and
        combine multiple conditions to precisely target your recipients.
      </Alert>

      <FilterGroup
        group={filterGroup}
        onUpdate={handleFilterChange}
        onDelete={() => {
          // Root group cannot be deleted, just reset
          handleFilterChange({
            id: "root",
            logic: "AND",
            rules: [],
            groups: [],
          });
        }}
        level={0}
        availableColumns={ITS_COLUMNS}
      />

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Preview Recipient Count
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Test your filters to see how many recipients match your criteria
          </Typography>
          <Button
            variant="contained"
            onClick={handlePreviewCount}
            disabled={previewLoading}
            sx={{ mb: 2 }}
          >
            {previewLoading ? "Calculating..." : "Preview Count"}
          </Button>

          {previewError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {previewError}
            </Alert>
          )}

          {previewCount !== null && !previewError && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="h6">{previewCount}</Typography>
                <Typography variant="body2">
                  recipients match your filter criteria
                </Typography>
              </Alert>

              {/* Selected Fields Display */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
                >
                  Fields in Preview:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.75,
                    mt: 1,
                  }}
                >
                  {getSelectedFields().map((fieldId) => {
                    const isAlwaysShown =
                      fieldId === "ITS_ID" || fieldId === "Full_Name";
                    return (
                      <Chip
                        key={fieldId}
                        label={getFieldLabel(fieldId)}
                        size="small"
                        color={isAlwaysShown ? "primary" : "default"}
                        sx={{
                          fontSize: "0.75rem",
                          height: 24,
                        }}
                      />
                    );
                  })}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  * Blue chips indicate fields always shown (ITS ID, Full Name)
                </Typography>
              </Box>

              {/* Open in New Tab Button */}
              <Button
                variant="outlined"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenInNewTab}
                size="small"
                sx={{ fontSize: "0.8125rem" }}
              >
                Open Preview in ITS Data
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdvancedFilterBuilder;
