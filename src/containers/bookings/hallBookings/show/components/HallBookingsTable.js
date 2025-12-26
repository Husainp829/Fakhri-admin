/* eslint-disable no-console */
import React, { useState } from "react";
import {
  useRecordContext,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  SelectInput,
  BooleanInput,
  useRefresh,
  ReferenceInput,
  Button,
  Create,
  useDelete,
  Confirm,
  useNotify,
  Toolbar,
  DeleteButton,
  SaveButton,
  usePermissions,
} from "react-admin";
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { slotNameMap } from "../../../../../constants";
import { hasPermission } from "../../../../../utils/permissionUtils";

const CustomToolbar = ({ onClose, ...props }) => {
  const refresh = useRefresh();

  return (
    <Toolbar
      {...props}
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <SaveButton />
      <DeleteButton
        mutationOptions={{
          onSuccess: () => {
            onClose();
            refresh();
          },
        }}
      />
    </Toolbar>
  );
};

const HallBookingEditModal = ({ id, open, onClose }) => {
  const refresh = useRefresh();
  if (!id) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Hall Booking{" "}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* You can also use <Edit> if you want RA's full controller */}
        <Edit
          resource="hallBookings"
          id={id}
          mutationMode="pessimistic"
          redirect={false}
          actions={false}
          mutationOptions={{
            onSuccess: () => {
              onClose();
              refresh();
            },
          }}
        >
          <SimpleForm toolbar={<CustomToolbar onClose={onClose} />}>
            <TextInput source="hall.name" label="Hall" disabled fullWidth />
            <NumberInput source="thaals" label="Thaals" fullWidth />
            <ReferenceInput
              source="purpose"
              reference="bookingPurpose"
              fullWidth
            >
              <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <DateInput source="date" label="Date" fullWidth />
            <SelectInput
              source="slot"
              label="Slot"
              choices={Object.entries(slotNameMap).map(([i, name]) => ({
                id: i,
                name,
              }))}
              fullWidth
            />
            <BooleanInput source="withAC" label="With AC" fullWidth />
          </SimpleForm>
        </Edit>
      </DialogContent>
    </Dialog>
  );
};

const HallBookingCreateModal = ({ open, onClose, bookingId }) => {
  const refresh = useRefresh();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Hall Booking
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Create
          resource="hallBookings"
          redirect={false}
          mutationOptions={{
            onSuccess: () => {
              onClose(); // Close after successful create
              refresh(); // Refresh the list
            },
          }}
        >
          <SimpleForm defaultValues={{ bookingId }}>
            <ReferenceInput source="hallId" reference="halls">
              <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <ReferenceInput
              source="purpose"
              reference="bookingPurpose"
              fullWidth
            >
              <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <NumberInput source="thaals" label="Thaals" fullWidth />
            <DateInput source="date" label="Date" fullWidth />
            <SelectInput
              source="slot"
              label="Slot"
              choices={Object.entries(slotNameMap).map(([id, name]) => ({
                id,
                name,
              }))}
              fullWidth
            />
            <BooleanInput source="withAC" label="With AC" fullWidth />
          </SimpleForm>
        </Create>
      </DialogContent>
    </Dialog>
  );
};

const HallBookingsTable = () => {
  const refresh = useRefresh();
  const notify = useNotify();
  const record = useRecordContext();
  const { permissions } = usePermissions();
  const hallBookings = record.hallBookings || [];
  const [editId, setEditId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteOne] = useDelete();

  const handleEdit = (id) => {
    setEditId(id);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditId(null);
  };
  const handleDelete = () => {
    deleteOne(
      "hallBookings", // resource
      { id: selectedId, previousData: { id: selectedId } },
      {
        onSuccess: () => {
          notify("Hall booking deleted", { type: "info" });
          refresh();
        },
        onError: (error) => {
          notify(`Error: ${error.message}`, { type: "warning" });
        },
      }
    );
    setOpen(false);
  };

  return (
    <Box mb={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Hall Bookings</Typography>
        {hasPermission(permissions, "bookings.edit") &&
          !record.checkedOutOn && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenCreate(true)}
            >
              Add Hall
            </Button>
          )}
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hall</TableCell>
            <TableCell>Purpose</TableCell>
            <TableCell>AC</TableCell>
            <TableCell>Thaals</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Slot</TableCell>
            {hasPermission(permissions, "bookings.edit") &&
              !record.checkedOutOn && (
                <TableCell align="right">Actions</TableCell>
              )}
          </TableRow>
        </TableHead>
        <TableBody>
          {hallBookings.length > 0 ? (
            hallBookings
              .slice()
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((hb) => (
                <TableRow key={hb.id}>
                  <TableCell>{hb.hall?.name}</TableCell>
                  <TableCell>{hb.purpose}</TableCell>
                  <TableCell>{hb.withAC ? "With AC" : "W/O AC"}</TableCell>
                  <TableCell>{hb.thaals}</TableCell>
                  <TableCell>
                    {new Date(hb.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{slotNameMap[hb.slot]}</TableCell>
                  {hasPermission(permissions, "bookings.edit") &&
                    !record.checkedOutOn && (
                      <TableCell align="right">
                        <IconButton onClick={() => handleEdit(hb.id)}>
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedId(hb.id);
                            setOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hall bookings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Confirm
        isOpen={open}
        title="Delete Hall Booking"
        content="Are you sure you want to permanently delete this hall booking?"
        onConfirm={handleDelete}
        onClose={() => setOpen(false)}
      />

      <HallBookingEditModal
        id={editId}
        open={modalOpen}
        onClose={handleClose}
      />
      <HallBookingCreateModal
        open={openCreate}
        bookingId={record.id}
        onClose={() => setOpenCreate(false)}
      />
    </Box>
  );
};

export default HallBookingsTable;
