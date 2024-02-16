/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import * as React from "react";
import { useNotify } from "react-admin";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Grid from "@mui/material/Grid";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import Slide from "@mui/material/Slide";
import EditableTable from "./editableTable";
import { uploadBase64Media } from "../../../dataprovider/uploadProps";

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function FullScreenDialog() {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const notify = useNotify();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setData([]);
    setSelectedRows([]);
  };

  // const [create] = useCreate();

  const onRegisterationSave = () => {
    setLoading(true);
    setLoading(false);
    notify("ITS Updated added Successfully");
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });

  const onImport = async (file) => {
    try {
      setLoading(true);
      const bs64 = await getBase64(file);
      const imageUrl = await uploadBase64Media(bs64);
      setLoading(false);
    } catch (err) {
      notify(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        startIcon={<ImportExportIcon />}
        variant="link"
        sx={{ padding: "2px 4px" }}
        onClick={handleClickOpen}
      >
        IMPORT
      </Button>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              ITS Upload {`${data?.length > 1 ? `(${data.length} records)` : ""}`}
            </Typography>
            {data.length ? (
              <Button
                startIcon={<SaveIcon />}
                autoFocus
                color="inherit"
                onClick={onRegisterationSave}
              >
                save
              </Button>
            ) : (
              ""
            )}
          </Toolbar>
        </AppBar>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ height: "100%" }}
        >
          {data.length ? (
            <Grid item xs={12}>
              <EditableTable
                data={data}
                setData={setData}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
              />
            </Grid>
          ) : (
            <Grid item xs={3} sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                component="label"
                size="large"
                sx={{ width: "100%", minHeight: "100px" }}
              >
                Import ITS DATA
                <input
                  hidden
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  type="file"
                  onChange={(e) => onImport(e.target.files[0])}
                />
              </Button>
              <Button
                variant="link"
                sx={{ mt: 2 }}
                href={`${window.location.origin}/ITSUploadFormat.xlsx`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Format
              </Button>
            </Grid>
          )}
        </Grid>
        <Backdrop sx={{ color: "#000", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Dialog>
    </div>
  );
}
