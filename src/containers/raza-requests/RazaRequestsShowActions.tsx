import { useState } from "react";
import {
  EditButton,
  TopToolbar,
  ListButton,
  Button,
  useRecordContext,
  Confirm,
  useNotify,
  useRefresh,
} from "react-admin";
import PrintIcon from "@mui/icons-material/Print";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { callApi } from "@/dataprovider/misc-apis";

const PrintRazaButton = () => {
  const record = useRecordContext<{ id?: string; razaGranted?: string | null }>();
  if (!record?.id || record.razaGranted) return null;
  return (
    <Button
      label="Raza form"
      onClick={() => window.open(`#/raza-request-print/${record.id}`, "_blank")}
    >
      <PrintIcon />
    </Button>
  );
};

const RazaRequestsShowActions = () => {
  const record = useRecordContext<{ id?: string; razaGranted?: string | null }>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGrantRaza = async () => {
    if (!record?.id) return;
    setLoading(true);
    try {
      await callApi({
        location: `razaRequests/${record.id}/grant-raza`,
        method: "PUT",
        data: {},
      });
      notify("Raza marked as granted", { type: "success" });
      setConfirmOpen(false);
      refresh();
    } catch {
      notify("Something went wrong", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopToolbar>
        <ListButton />
        <EditButton />
        <PrintRazaButton />
        {record?.id && !record.razaGranted && (
          <Button
            label="Mark raza granted"
            onClick={() => setConfirmOpen(true)}
            sx={{ color: "success.main" }}
          >
            <DoneAllIcon />
          </Button>
        )}
      </TopToolbar>
      <Confirm
        isOpen={confirmOpen}
        loading={loading}
        title="Confirm Raza granted"
        content="Are you sure you want to mark Raza as granted for this request?"
        onConfirm={() => void handleGrantRaza()}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default RazaRequestsShowActions;
