import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNotify, useRefresh } from "react-admin";
import { callApi } from "../../../dataprovider/miscApis";

export default function WriteoffDialog({ open, onClose, selectedIds }) {
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClose = () => {
    if (!loading) {
      setAuthorizedBy("");
      setRemarks("");
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!authorizedBy.trim()) {
      setError("Authorized By is required");
      return;
    }

    if (!selectedIds || selectedIds.length === 0) {
      setError("Please select at least one ledger entry");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await callApi({
        location: "sabilLedger",
        method: "POST",
        id: "writeoff",
        data: {
          ledgerEntryIds: selectedIds,
          authorizedBy: authorizedBy.trim(),
          remarks: remarks.trim() || undefined,
        },
      });

      if (response?.data) {
        notify(
          `Successfully wrote off ${
            response.data.count || selectedIds.length
          } ledger entry/entries`,
          {
            type: "success",
          }
        );
        refresh();
        handleClose();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to write off ledger entries";
      setError(errorMessage);
      notify(errorMessage, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Write Off Ledger Entries</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to write off {selectedIds?.length || 0} ledger entry/entries. This action
            cannot be undone.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="Authorized By"
            fullWidth
            required
            value={authorizedBy}
            onChange={(e) => setAuthorizedBy(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            helperText="Name of the person authorizing this writeoff"
          />

          <TextField
            label="Remarks"
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={loading}
            helperText="Optional remarks for this writeoff"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={loading || !authorizedBy.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Write Off
        </Button>
      </DialogActions>
    </Dialog>
  );
}
