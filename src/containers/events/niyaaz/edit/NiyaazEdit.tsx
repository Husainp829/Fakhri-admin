import {
  Edit,
  useNotify,
  SimpleForm,
  Toolbar,
  SaveButton,
  useRecordContext,
  type EditProps,
} from "react-admin";
import { NiyaazEditForm } from "./NiyaazEditForm";

const EditToolbar = () => (
  <Toolbar>
    <SaveButton />
  </Toolbar>
);

type FamilyMemberInput = {
  name?: string;
  age?: string;
  its?: string;
  gender?: string;
};

export const NiyaazEdit = (props: EditProps) => {
  const notify = useNotify();
  const onFailure = (error: Error) => {
    notify(`Could not edit post: ${error.message}`);
  };

  const validateNiyaazUpdation = (values: Record<string, unknown>) => {
    const errors: Record<string, unknown> = {};
    if (!values.markaz) {
      errors.markaz = "The markaz is required";
    }
    if (!values.namaazVenue) {
      errors.namaazVenue = "The namaaz venue is required";
    }
    if (!values.HOFId) {
      errors.markaz = "The HOF ITS is required";
    }
    if (!values.HOFName) {
      errors.markaz = "The HOF Name is required";
    }
    const familyMembers = values.familyMembers as FamilyMemberInput[] | undefined;
    if (familyMembers && familyMembers.length > 0) {
      errors.familyMembers = familyMembers.map((member) => {
        const memberErrors: Record<string, string> = {};
        if (!member?.name) {
          memberErrors.name = "The name is required";
        }
        if (!member?.age) {
          memberErrors.age = "The age is required";
        }
        if (!member?.its) {
          memberErrors.its = "The its is required";
        }
        if (!member?.gender) {
          memberErrors.gender = "The gender is required";
        }
        return memberErrors;
      });
    }
    return errors;
  };

  return (
    <Edit {...props} onFailure={onFailure} title={<NiyaazEditTitle />}>
      <SimpleForm
        warnWhenUnsavedChanges
        toolbar={<EditToolbar />}
        validate={validateNiyaazUpdation}
      >
        <NiyaazEditForm />
      </SimpleForm>
    </Edit>
  );
};

const NiyaazEditTitle = () => {
  const record = useRecordContext<{ formNo?: string }>();
  return <span>{record ? `Form No. ${record.formNo}` : ""}</span>;
};
