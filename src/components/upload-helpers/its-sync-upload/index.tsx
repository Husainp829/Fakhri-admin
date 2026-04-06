import * as React from "react";
import { useNotify } from "react-admin";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { callApi } from "@/dataprovider/misc-apis";

export type ITSSyncUploadButtonProps = {
  variant?: "text" | "outlined" | "contained";
};

export default function ITSSyncUploadButton({ variant = "text" }: ITSSyncUploadButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const notify = useNotify();

  const convertFileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (error) => reject(error);
    });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".xlsx") &&
      file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      notify("Please select a valid XLSX file", { type: "error" });
      return;
    }

    setLoading(true);

    try {
      const base64String = await convertFileToBase64(file);
      const base64Data = base64String.split(",").pop();

      const response = await callApi({
        location: "itsdata/sync",
        method: "POST",
        data: {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          base64Image: base64Data,
          fileName: file.name,
        },
      });

      const data = response?.data as { addressChangeQueueCount?: number } | undefined;
      const n = data?.addressChangeQueueCount;
      if (typeof n === "number" && n > 0) {
        notify(
          `Sync completed. ${n} address change${n === 1 ? "" : "s"} queued — update the external portal and mark them done under ITS address updates.`,
          { type: "success" }
        );
      } else {
        notify("File synced successfully", { type: "success" });
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = err.response?.data?.message || err.message || "Failed to sync file";
      notify(errorMessage, { type: "error" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        startIcon={<ImportExportIcon />}
        variant={variant}
        component="label"
        disabled={loading}
        size="small"
      >
        {loading ? "Syncing..." : "Sync XLSX"}
        <input
          ref={fileInputRef}
          hidden
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
          type="file"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </Button>
      <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}
