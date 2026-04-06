import {
  Create,
  useNotify,
  SimpleForm,
  useRedirect,
  useStore,
  type CreateProps,
  type RaRecord,
} from "react-admin";
import { NiyaazCreateForm } from "./NiyaazCreateForm";
import { calcTotalPayable } from "@/utils";
import type { NiyaazPayableData } from "@/utils/app-formatters";
import type { CurrentEvent } from "@/containers/events/types";

type FamilyMemberInput = {
  name?: string;
  age?: string;
  its?: string;
  gender?: string;
};

export const NiyaazCreate = (props: CreateProps) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const onFailure = (error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);
    notify(`Could not edit post: ${msg}`);
  };

  const [currentEvent] = useStore<CurrentEvent | null>("currentEvent");

  const validateNiyaazCreation = (values: Record<string, unknown>) => {
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
    if (!familyMembers || !familyMembers.length) {
      errors.familyMembers = "Atleast 1 Family Member required";
    } else {
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
    const paid = Number(values.paidAmount);
    if (paid > 0 && !values.mode) {
      errors.mode = "Payment Mode is Required";
    }
    const totalPayable = calcTotalPayable(currentEvent ?? {}, values as NiyaazPayableData);
    if (paid > totalPayable) {
      errors.paidAmount = "Payment Amount cannot be greater than payable";
    }
    return errors;
  };

  const onSuccess = (data: RaRecord) => {
    notify(`Niyaaz form created - ${String(data.formNo ?? "")}`, {
      autoHideDuration: 5000,
      type: "success",
    });
    redirect("/niyaaz");
  };

  return (
    <Create
      {...({
        ...props,
        onFailure,
        redirect: false,
        mutationOptions: { onSuccess },
      } as CreateProps)}
    >
      <SimpleForm warnWhenUnsavedChanges validate={validateNiyaazCreation}>
        <NiyaazCreateForm />
      </SimpleForm>
    </Create>
  );
};
