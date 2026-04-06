import { useState, useCallback, type ComponentProps } from "react";
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

type QuickCreateField = { source: string; label: string };

type CustomQuickCreateButtonProps = {
  fields: QuickCreateField[];
  source: string;
  name: string;
  title: string;
  onChange: () => void;
  defaultKey: string;
};

function CustomQuickCreateButton({
  fields,
  source,
  name,
  title,
  onChange,
  defaultKey,
}: CustomQuickCreateButtonProps) {
  const { filter, onCancel } = useCreateSuggestionContext();
  const [create, { isLoading }] = useCreate();
  const notify = useNotify();
  const { setValue } = useFormContext();

  const handleSubmit = async (values: Record<string, unknown>) => {
    const data = await create(name, { data: values }, { returnPromise: true }).catch(
      (err: unknown) => {
        const message =
          err &&
          typeof err === "object" &&
          "error" in err &&
          err.error &&
          typeof err.error === "object"
            ? String((err.error as { message?: string }).message ?? "Error")
            : "Error";
        notify(message, { type: "error" });
      }
    );
    if (data && typeof data === "object" && "id" in data) {
      onChange();
      setTimeout(() => {
        setValue(source, (data as { id: unknown }).id);
      }, 1000);
    }
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

export type CustomReferenceInputProps = ComponentProps<typeof ReferenceInput> & {
  fields: QuickCreateField[];
  title: string;
  defaultKey: string;
};

const CustomReferenceInput = (props: CustomReferenceInputProps) => {
  const classes = useStyles();
  const [version, setVersion] = useState(0);
  const handleChange = useCallback(() => setVersion((v) => v + 1), []);

  const {
    fields,
    title,
    defaultKey,
    optionText,
    optionValue,
    reference,
    source,
    ...referenceInputProps
  } = props;

  return (
    <div className={classes.root}>
      <ReferenceInput key={version} reference={reference} source={source} {...referenceInputProps}>
        <AutocompleteInput
          optionText={optionText}
          optionValue={optionValue}
          fullWidth
          create={
            <CustomQuickCreateButton
              onChange={handleChange}
              name={reference}
              source={source}
              fields={fields}
              title={title}
              defaultKey={defaultKey}
            />
          }
        />
      </ReferenceInput>
    </div>
  );
};

export default CustomReferenceInput;
