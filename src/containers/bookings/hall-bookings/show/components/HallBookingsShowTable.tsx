import type { ComponentProps } from "react";
import { useState } from "react";
import {
  useRecordContext,
  Edit,
  SimpleForm,
  TextInput,
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
import { slotNameMap } from "@/constants";
import { hasPermission } from "@/utils/permission-utils";
import { formatListDate } from "@/utils/date-format";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";

const CustomToolbar = ({
  onClose,
  ...props
}: { onClose: () => void } & ComponentProps<typeof Toolbar>) => {
  const refresh = useRefresh();

  return (
    <Toolbar {...props} sx={{ display: "flex", justifyContent: "space-between" }}>
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

const HallBookingEditModal = ({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) => {
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
            <NoArrowKeyNumberInput source="thaals" label="Thaals" fullWidth />
            <ReferenceInput source="purpose" reference="bookingPurpose" fullWidth>
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
            <TextInput source="remarks" label="Remarks" fullWidth multiline minRows={2} />
          </SimpleForm>
        </Edit>
      </DialogContent>
    </Dialog>
  );
};

const HallBookingCreateModal = ({
  open,
  onClose,
  bookingId,
}: {
  open: boolean;
  onClose: () => void;
  bookingId: string | number | undefined;
}) => {
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
              onClose();
              refresh();
            },
          }}
        >
          <SimpleForm defaultValues={{ bookingId }}>
            <ReferenceInput source="hallId" reference="halls">
              <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <ReferenceInput source="purpose" reference="bookingPurpose" fullWidth>
              <SelectInput optionText="name" fullWidth />
            </ReferenceInput>
            <NoArrowKeyNumberInput source="thaals" label="Thaals" fullWidth />
            <DateInput source="date" label="Date" fullWidth />
            <SelectInput
              source="slot"
              label="Slot"
              choices={Object.entries(slotNameMap).map(([slotId, name]) => ({
                id: slotId,
                name,
              }))}
              fullWidth
            />
            <BooleanInput source="withAC" label="With AC" fullWidth />
            <TextInput source="remarks" label="Remarks" fullWidth multiline minRows={2} />
          </SimpleForm>
        </Create>
      </DialogContent>
    </Dialog>
  );
};

type HallBookingRow = {
  id: string;
  hall?: { name?: string };
  purpose?: string;
  withAC?: boolean;
  thaals?: number;
  date?: string;
  slot?: string;
  remarks?: string | null;
};

export const HallBookingsShowTable = () => {
  const refresh = useRefresh();
  const notify = useNotify();
  const record = useRecordContext();
  const { permissions } = usePermissions();
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteOne] = useDelete();

  if (!record) return null;

  const hallBookings = (record.hallBookings as HallBookingRow[] | undefined) || [];
  const showActions = hasPermission(permissions, "bookings.edit") && !record.checkedOutOn;
  const tableColSpan = showActions ? 8 : 7;

  const handleEdit = (id: string) => {
    setEditId(id);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteOne(
      "hallBookings",
      { id: selectedId, previousData: { id: selectedId } },
      {
        onSuccess: () => {
          notify("Hall booking deleted", { type: "info" });
          refresh();
        },
        onError: (error: unknown) => {
          notify(`Error: ${error instanceof Error ? error.message : String(error)}`, {
            type: "warning",
          });
        },
      }
    );
    setOpen(false);
  };

  return (
    <Box mb={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Hall Bookings</Typography>
        {showActions && (
          <Button variant="outlined" color="primary" onClick={() => setOpenCreate(true)}>
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
            <TableCell>Remarks</TableCell>
            {showActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {hallBookings.length > 0 ? (
            hallBookings
              .slice()
              .sort((a, b) => new Date(a.date ?? "").getTime() - new Date(b.date ?? "").getTime())
              .map((hb) => (
                <TableRow key={hb.id}>
                  <TableCell>{hb.hall?.name}</TableCell>
                  <TableCell>{hb.purpose}</TableCell>
                  <TableCell>{hb.withAC ? "With AC" : "W/O AC"}</TableCell>
                  <TableCell>{hb.thaals}</TableCell>
                  <TableCell>{hb.date ? formatListDate(hb.date) : ""}</TableCell>
                  <TableCell>{slotNameMap[hb.slot ?? ""] ?? hb.slot}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    {hb.remarks ? (
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {hb.remarks}
                      </Typography>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {showActions && (
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
              <TableCell colSpan={tableColSpan} align="center">
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

      <HallBookingEditModal id={editId} open={modalOpen} onClose={handleClose} />
      <HallBookingCreateModal
        open={openCreate}
        bookingId={record.id}
        onClose={() => setOpenCreate(false)}
      />
    </Box>
  );
};

export default HallBookingsShowTable;
