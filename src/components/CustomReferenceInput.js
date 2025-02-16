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
  useCreateSuggestionContext,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import IconCancel from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { makeStyles } from "@mui/styles";

function CustomQuickCreateButton({ fields, source, name, title, onChange, defaultKey }) {
  const { filter, onCancel } = useCreateSuggestionContext();
  const [create, { isLoading }] = useCreate();
  const notify = useNotify();
  const { setValue } = useFormContext();

  const handleSubmit = async (values) => {
    const data = await create(name, { data: values }, { returnPromise: true }).catch(
      ({ error }) => {
        notify(error.message, "error");
      }
    );
    onChange();
    setTimeout(() => {
      setValue(source, data.id);
    }, 1000);
  };

  return (
    <>
      <Dialog fullWidth open onClose={onCancel} aria-label="Create">
        <DialogTitle>Create {title}</DialogTitle>
        <Form onSubmit={handleSubmit} defaultValues={{ [defaultKey]: filter }}>
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
            <Button label="ra.action.cancel" onClick={onCancel} disabled={isLoading}>
              <IconCancel />
            </Button>
            <SaveButton alwaysEnable />
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
        <AutocompleteInput
          optionText={props.optionText}
          optionValue={props.optionValue}
          fullWidth
          create={
            <CustomQuickCreateButton
              onChange={handleChange}
              name={props.reference}
              source={props.source}
              fields={props.fields}
              title={props.title}
              defaultKey={props.defaultKey}
            />
          }
        />
      </ReferenceInput>
    </div>
  );
};

export default CustomReferenceInput;
