import React, { useEffect } from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  FormDataConsumer,
  ReferenceInput,
  AutocompleteInput,
  required,
  useRecordContext,
  useGetOne,
  minValue,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/GridLegacy";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import httpClient from "../../../dataprovider/httpClient";
import { getApiUrl } from "@/constants";
import { formatINR } from "@/utils";
import { BeneficiaryItsAutocomplete } from "./common/beneficiaryItsAutocomplete";
import { ITSInput } from "./common/itsInput";
import {
  validateContributionFmbOrPeriod,
  validatePositiveContributionTotal,
} from "./common/contributionFormValidators";
import { SeedOverrideAmountFromCalculated } from "./common/seedOverrideAmountFromCalculated";

function ClearTakhmeenWhenNoFmb() {
  const { control, setValue } = useFormContext();
  const fmbId = useWatch({ control, name: "fmbId" });

  useEffect(() => {
    if (!fmbId) {
      setValue("fmbTakhmeenId", null, { shouldDirty: false });
    }
  }, [fmbId, setValue]);

  return null;
}

function TakhmeenHijriSync() {
  const { setValue, control } = useFormContext();
  const fmbId = useWatch({ control, name: "fmbId" });
  const fmbTakhmeenId = useWatch({ control, name: "fmbTakhmeenId" });
  const { data: t } = useGetOne(
    "fmbTakhmeen",
    { id: fmbTakhmeenId },
    { enabled: Boolean(fmbId) && Boolean(fmbTakhmeenId) }
  );

  useEffect(() => {
    if (t?.hijriYearStart != null && fmbTakhmeenId) {
      setValue("hijriYearStart", t.hijriYearStart, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [t?.hijriYearStart, t?.id, fmbTakhmeenId, setValue]);

  return null;
}

const TYPE_CHOICES = [
  { id: "ZABIHAT", name: "Zabihat" },
  { id: "VOLUNTARY", name: "Voluntary" },
];

const transform = (data) => {
  const out = {
    contributionType: data.contributionType,
    beneficiaryItsNo: data.beneficiaryItsNo?.trim(),
    quantity: Number(data.quantity),
    isAmountOverridden: data.isAmountOverridden === true,
    remarks: data.remarks?.trim() || null,
  };
  if (data.fmbId) {
    out.fmbId = data.fmbId;
    out.fmbTakhmeenId = data.fmbTakhmeenId ?? null;
  }
  if (data.hijriYearStart !== undefined && data.hijriYearStart !== "") {
    out.hijriYearStart = Number(data.hijriYearStart);
  }
  if (data.unitAmount !== undefined && data.unitAmount !== "") {
    out.unitAmount = Number(data.unitAmount);
  }
  if (data.isAmountOverridden && data.amount !== undefined && data.amount !== "") {
    out.amount = Number(data.amount);
  }
  return out;
};

function validateContributionForm(values) {
  return {
    ...validateContributionFmbOrPeriod(values),
    ...validatePositiveContributionTotal(values),
  };
}

export default function FmbContributionsEdit(props) {
  const [defaultUnitAmount, setDefaultUnitAmount] = React.useState(undefined);

  useEffect(() => {
    httpClient(`${getApiUrl()}/fmbThaliSettings`)
      .then(({ json: { rows } }) => {
        setDefaultUnitAmount(rows?.[0]?.zabihatUnitAmount);
      })
      .catch(() => {});
  }, []);

  return (
    <Edit {...props} transform={transform} mutationMode="pessimistic">
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 760 }} validate={validateContributionForm}>
        <UnitAmountDefaultInitializer defaultUnitAmount={defaultUnitAmount} />
        <ClearTakhmeenWhenNoFmb />
        <TakhmeenHijriSync />
        <SeedOverrideAmountFromCalculated />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100}>
              <ITSInput
                label="FMB record (optional)"
                optionText={(r) => `${r.fileNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
                fullWidth
                debounce={300}
                filterToQuery={(q) => ({ search: q })}
              />
            </ReferenceInput>
          </Grid>
          <FormDataConsumer>
            {({ formData }) =>
              formData?.fmbId ? (
                <Grid item xs={12}>
                  <ReferenceInput
                    source="fmbTakhmeenId"
                    reference="fmbTakhmeen"
                    filter={{ fmbId: formData.fmbId }}
                    perPage={200}
                  >
                    <AutocompleteInput
                      fullWidth
                      label="Annual period (takhmeen)"
                      optionText={(choice) =>
                        `${choice.hijriYearStart ?? "—"}–${choice.hijriYearEnd ?? "—"} · ${formatINR(
                          choice.takhmeenAmount,
                          { empty: "—" }
                        )}`
                      }
                      shouldRenderSuggestions={(val) => val.trim().length >= 0}
                      noOptionsText="No annual periods for this FMB"
                    />
                  </ReferenceInput>
                </Grid>
              ) : null
            }
          </FormDataConsumer>
          <FmbHouseholdSummaryAndItsSync />
          <Grid item xs={12} sm={6}>
            <SelectInput
              source="contributionType"
              label="Contribution type"
              choices={TYPE_CHOICES}
              fullWidth
              validate={[required()]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NoArrowKeyNumberInput
              source="hijriYearStart"
              label="Hijri year start (required if no FMB record)"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <BeneficiaryItsAutocomplete />
          </Grid>
          <Grid item xs={12} sm={4}>
            <NoArrowKeyNumberInput
              source="quantity"
              label="Quantity"
              fullWidth
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <NoArrowKeyNumberInput source="unitAmount" label="Unit amount" fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CalculatedTotalAmountField />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BooleanInput source="isAmountOverridden" label="Override total amount" />
          </Grid>
          <FormDataConsumer>
            {({ formData }) =>
              formData?.isAmountOverridden ? (
                <Grid item xs={12} sm={6}>
                  <NoArrowKeyNumberInput
                    source="amount"
                    label="Amount (override)"
                    fullWidth
                    validate={[required(), minValue(1)]}
                  />
                </Grid>
              ) : null
            }
          </FormDataConsumer>
          <Grid item xs={12}>
            <TextInput source="remarks" fullWidth multiline minRows={2} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
}

/**
 * Reflects the **current** FMB selection from the form (not only the loaded record).
 * Renders FMB number + HOF ITS; pre-fills beneficiary HOF ITS when that field is empty.
 */
function FmbHouseholdSummaryAndItsSync() {
  const { control, setValue, getValues } = useFormContext();
  const fmbId = useWatch({ control, name: "fmbId" });
  const { data: fmb } = useGetOne("fmbData", { id: fmbId }, { enabled: Boolean(fmbId) });

  useEffect(() => {
    const raw = fmb?.itsNo;
    if (raw == null || raw === "") return;
    const hofIts = String(raw).trim();
    if (!hofIts) return;
    const b = getValues("beneficiaryItsNo");
    const bEmpty = b == null || String(b).trim() === "";
    if (bEmpty) {
      setValue("beneficiaryItsNo", hofIts, { shouldDirty: false, shouldTouch: false });
    }
  }, [fmb, fmbId, getValues, setValue]);

  if (!fmbId) {
    return (
      <Grid item xs={12}>
        <TextField
          label="FMB link"
          value="Standalone — beneficiary ITS + Hijri period (no FMB record)"
          fullWidth
          disabled
          InputProps={{ readOnly: true }}
        />
      </Grid>
    );
  }

  return (
    <>
      <Grid item xs={12} sm={6}>
        <TextField
          label="File no."
          value={fmb?.fileNo != null && fmb.fileNo !== "" ? String(fmb.fileNo) : ""}
          fullWidth
          disabled
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="HOF ITS"
          value={fmb?.itsNo != null && fmb.itsNo !== "" ? String(fmb.itsNo) : ""}
          fullWidth
          disabled
          InputProps={{ readOnly: true }}
        />
      </Grid>
    </>
  );
}

function UnitAmountDefaultInitializer({ defaultUnitAmount }) {
  const record = useRecordContext();
  const { getValues, setValue } = useFormContext();

  useEffect(() => {
    if (defaultUnitAmount == null) return;

    const recordUnitAmount = record?.unitAmount;
    const currentUnitAmount = getValues("unitAmount");
    const isRecordEmpty =
      recordUnitAmount === undefined || recordUnitAmount === null || recordUnitAmount === "";
    const isCurrentEmpty =
      currentUnitAmount === undefined || currentUnitAmount === null || currentUnitAmount === "";

    if (isRecordEmpty && isCurrentEmpty) {
      setValue("unitAmount", defaultUnitAmount, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [defaultUnitAmount, getValues, record, setValue]);

  return null;
}

function CalculatedTotalAmountField() {
  const { control } = useFormContext();
  const quantity = useWatch({ control, name: "quantity" });
  const unitAmount = useWatch({ control, name: "unitAmount" });

  const q = Number(quantity) || 0;
  const u = Number(unitAmount) || 0;
  const total = q * u;

  return (
    <TextField
      label="Calculated total amount"
      value={total}
      fullWidth
      disabled
      inputProps={{ inputMode: "numeric" }}
    />
  );
}
