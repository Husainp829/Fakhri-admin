import * as React from "react";
import { useNotify } from "react-admin";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { callApi } from "../../../dataprovider/miscApis";

export default function ITSSyncUploadButton({ variant = "text" }) {
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const notify = useNotify();

  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (
      !file.name.endsWith(".xlsx") &&
      file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      notify("Please select a valid XLSX file", { type: "error" });
      return;
    }

    setLoading(true);

    try {
      // Convert file to base64
      const base64String = await convertFileToBase64(file);
      // Remove the data URL prefix (data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,)
      const base64Data = base64String.split(",").pop();

      // Call the sync API
      await callApi({
        location: "itsdata/sync",
        method: "POST",
        data: {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          base64Image: base64Data,
          fileName: file.name,
        },
      });

      notify("File synced successfully", { type: "success" });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to sync file";
      notify(errorMessage, { type: "error" });
      // Reset file input
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
