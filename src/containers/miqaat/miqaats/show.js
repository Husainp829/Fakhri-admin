import React, { useState, useEffect } from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  FunctionField,
  useShowController,
} from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import dayjs from "dayjs";
import { callApi } from "../../../dataprovider/miscApis";

const mealTypeLabel = (mealType) => (mealType === "LUNCH" ? "Lunch" : "Evening");

const RsvpsSection = ({ miqaatId }) => {
  const [rsvps, setRsvps] = useState({ rows: [], count: 0, summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRsvps = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await callApi({
          location: "miqaats",
          method: "GET",
          id: `${miqaatId}/rsvps`,
        });
        if (!cancelled && res?.data) {
          setRsvps({
            rows: res.data.rows || [],
            count: res.data.count || 0,
            summary: res.data.summary || null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load RSVPs");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRsvps();
    return () => {
      cancelled = true;
    };
  }, [miqaatId]);

  if (loading) {
    return (
      <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>HOF (ITS No)</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Attending</TableCell>
              <TableCell>Submitted</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rsvps.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No RSVPs yet
                </TableCell>
              </TableRow>
            ) : (
              rsvps.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.itsNo}</TableCell>
                  <TableCell>{row.hofName || "—"}</TableCell>
                  <TableCell>
                    {Array.isArray(row.familyAttendingIds) ? row.familyAttendingIds.length : 0}
                  </TableCell>
                  <TableCell>
                    {row.submittedAt ? dayjs(row.submittedAt).format("DD MMM YYYY, HH:mm") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

const MiqaatShow = (props) => {
  const { record } = useShowController(props);
  if (!record) return null;

  return (
    <Show {...props} title={record.name}>
      <Box component="span" sx={{ display: "block" }}>
        <SimpleShowLayout>
          <TextField source="name" label="Name" />
          <TextField source="venue" label="Venue" />
          <DateField source="englishDate" label="Date" showTime={false} />
          <FunctionField
            label="Slot"
            source="mealType"
            render={(r) => mealTypeLabel(r?.mealType)}
          />
        </SimpleShowLayout>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              RSVPs
            </Typography>
            <RsvpsSection miqaatId={record.id} />
          </CardContent>
        </Card>
      </Box>
    </Show>
  );
};

export default MiqaatShow;
