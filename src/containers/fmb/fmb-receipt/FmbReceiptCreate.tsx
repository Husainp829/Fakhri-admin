import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TextInput,
  Create,
  SimpleForm,
  ReferenceInput,
  DateInput,
  RadioButtonGroupInput,
  required,
  type CreateProps,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { ITSInput } from "./common/FmbReceiptItsInput";
import { LINE_KIND } from "./allocation/lineKind";
import type { AllocationFormRow } from "./allocation/types";
import { PaymentTotalAndAllocationsSection } from "./allocation/PaymentTotalAndAllocationsSection";
import { FmbPaymentCreditReadout } from "./FmbPaymentCreditReadout";
import {
  renderFmbReceiptItsOption,
  transformFmbReceiptPayload,
  validateFmbReceiptForm,
} from "./fmbReceiptCreateForm";

export default function FmbReceiptCreate(props: CreateProps) {
  const [searchParams] = useSearchParams();
  const fmbId = searchParams.get("fmbId") || undefined;
  const fmbTakhmeenId = searchParams.get("fmbTakhmeenId") || undefined;
  const fmbContributionId = searchParams.get("fmbContributionId") || undefined;

  const defaultAllocations = useMemo((): AllocationFormRow[] => {
    if (fmbContributionId) {
      return [
        {
          lineKind: LINE_KIND.CONTRIBUTION,
          fmbContributionId,
          fmbTakhmeenId: null,
          amount: "",
        },
      ];
    }
    if (fmbTakhmeenId) {
      return [
        {
          lineKind: LINE_KIND.ANNUAL,
          fmbTakhmeenId,
          fmbContributionId: null,
          amount: "",
        },
      ];
    }
    return [
      {
        lineKind: LINE_KIND.ANNUAL,
        fmbTakhmeenId: null,
        fmbContributionId: null,
        amount: "",
      },
    ];
  }, [fmbTakhmeenId, fmbContributionId]);

  const defaultValues = useMemo(
    () => ({
      fmbId,
      paymentMode: "CASH",
      receiptDate: new Date(),
      amountConfirmed: false,
      creditUsed: 0,
      allocations: [],
    }),
    [fmbId]
  );

  return (
    <Create {...props} transform={transformFmbReceiptPayload}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        defaultValues={defaultValues}
        validate={validateFmbReceiptForm}
      >
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReferenceInput source="fmbId" reference="fmbData">
              <ITSInput
                fullWidth
                size="small"
                label="ITS No."
                optionText={renderFmbReceiptItsOption}
                shouldRenderSuggestions={(val: string) => val.trim().length > 3}
                noOptionsText="Enter valid ITS No."
                syncAnnualContext
              />
            </ReferenceInput>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput source="name" label="FMB account holder name" fullWidth disabled />
          </Grid>
        </Grid>

        <FmbPaymentCreditReadout />

        <PaymentTotalAndAllocationsSection allocationTemplate={defaultAllocations} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateInput source="receiptDate" label="Receipt date" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 12 }}>
            <RadioButtonGroupInput
              source="paymentMode"
              label="Payment mode"
              choices={[
                { id: "CASH", name: "CASH" },
                { id: "ONLINE", name: "ONLINE" },
                { id: "CHEQUE", name: "CHEQUE" },
              ]}
              fullWidth
              validate={[required()]}
            />
          </Grid>
        </Grid>

        <TextInput source="remarks" fullWidth />
      </SimpleForm>
    </Create>
  );
}
