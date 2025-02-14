/* eslint-disable no-console */
import React, { useState, useCallback } from "react";
import {
  required,
  Button,
  SaveButton,
  TextInput,
  useCreate,
  useNotify,
  Form,
  ReferenceInput,
  AutocompleteInput,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import IconContentAdd from "@mui/icons-material/Add";
import IconCancel from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { makeStyles } from "@mui/styles";

function CustomQuickCreateButton({ onChange, fields, source, name, title }) {
  const [showDialog, setShowDialog] = useState(false);

  const [create, { isLoading }] = useCreate();
  const notify = useNotify();
  const { setValue } = useFormContext();
  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseClick = () => {
    setShowDialog(false);
  };

  const handleSubmit = async (values) => {
    create(
      name,
      { data: values },
      {
        onSuccess: (data) => {
          setShowDialog(false);
          setValue(source, data.id);
          onChange();
        },
        onFailure: ({ error }) => {
          notify(error.message, "error");
        },
      }
    );
  };

  return (
    <>
      <Button onClick={handleClick} label="ra.action.create" sx={{ mt: 2, ml: 1 }}>
        <IconContentAdd />
      </Button>
      <Dialog fullWidth open={showDialog} onClose={handleCloseClick} aria-label="Create">
        <DialogTitle>Create {title}</DialogTitle>
        <Form onSubmit={handleSubmit}>
          <DialogContent>
            {fields.map((field) => (
              <TextInput
                key={field.source}
                source={field.source}
                label={field.label}
                validate={required()}
                fullWidth
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button label="ra.action.cancel" onClick={handleCloseClick} disabled={isLoading}>
              <IconCancel />
            </Button>
            <SaveButton disabled={isLoading} />
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "flex-start",
    width: "100%",
  },
});

const CustomReferenceInput = (props) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const handleChange = useCallback(() => setVersion(version + 1), [version]);
  return (
    <div className={classes.root}>
      <ReferenceInput key={version} {...props}>
        <AutocompleteInput optionText={props.optionText} fullWidth />
      </ReferenceInput>
      <CustomQuickCreateButton
        onChange={handleChange}
        name={props.reference}
        source={props.source}
        fields={props.fields}
        title={props.title}
      />
    </div>
  );
};

export default CustomReferenceInput;
