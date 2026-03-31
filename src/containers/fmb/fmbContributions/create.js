import React, { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  required,
  SelectInput,
  BooleanInput,
  FormDataConsumer,
  AutocompleteInput,
  useGetList,
  useGetOne,
  minValue,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/GridLegacy";
import NoArrowKeyNumberInput from "../../../components/NoArrowKeyNumberInput";
import { ITSInput } from "./common/itsInput";
import { BeneficiaryItsAutocomplete } from "./common/beneficiaryItsAutocomplete";
import { formatINR } from "../../../utils";
import {
  validateContributionFmbOrPeriod,
  validatePositiveContributionTotal,
} from "./common/contributionFormValidators";
import { SeedOverrideAmountFromCalculated } from "./common/seedOverrideAmountFromCalculated";

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
    remarks: data.remarks?.trim() || undefined,
  };

  if (data.fmbId) {
    out.fmbId = data.fmbId;
  }
  if (data.fmbTakhmeenId) {
    out.fmbTakhmeenId = data.fmbTakhmeenId;
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

export default function FmbContributionsCreate(props) {
  const [searchParams] = useSearchParams();
  const prefFmbId = searchParams.get("fmbId") || "";
  const { data: thaliSettingsRows = [] } = useGetList(
    "fmbThaliSettings",
    {
      pagination: { page: 1, perPage: 1 },
    },
    { enabled: true },
  );
  const defaultUnitAmount = thaliSettingsRows?.[0]?.zabihatUnitAmount;

  const defaultValues = useMemo(
    () => ({
      fmbId: prefFmbId || undefined,
      contributionType: "ZABIHAT",
      quantity: 1,
      isAmountOverridden: false,
    }),
    [prefFmbId],
  );

  return (
    <Create {...props} transform={transform} mutationMode="pessimistic">
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 760 }}
        defaultValues={defaultValues}
        validate={validateContributionForm}
      >
        <UnitAmountDefaultInitializer defaultUnitAmount={defaultUnitAmount} />
        <PrefetchFmbItsDefaults prefFmbId={prefFmbId} />
        <ClearTakhmeenWhenNoFmb />
        <TakhmeenHijriSync />
        <SeedOverrideAmountFromCalculated />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100}>
              <ITSInput
                label="FMB record (optional)"
                optionText={(r) => `${r.fmbNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
                fullWidth
                debounce={300}
                filterToQuery={(q) => ({ search: q })}
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="fmbNo" label="FMB number" fullWidth disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextInput source="name" label="Account name" fullWidth disabled />
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
                        `${choice.hijriYearStart ?? choice.takhmeenYear ?? "—"}–${
                          choice.hijriYearEnd ?? "—"
                        } · ${formatINR(choice.takhmeenAmount, { empty: "—" })}`
                      }
                      shouldRenderSuggestions={(val) => val.trim().length >= 0}
                      noOptionsText="No annual periods for this FMB"
                    />
                  </ReferenceInput>
                </Grid>
              ) : null
            }
          </FormDataConsumer>
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
          <Grid item xs={12} sm={6}>
            <BeneficiaryItsAutocomplete />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NoArrowKeyNumberInput
              source="quantity"
              label="Quantity"
              fullWidth
              validate={[required(), minValue(1)]}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <NoArrowKeyNumberInput
              source="unitAmount"
              label="Unit amount (optional for Zabihat)"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
    </Create>
  );
}

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

/** When a takhmeen row is chosen, align Hijri year start with that period. */
function TakhmeenHijriSync() {
  const { setValue, control } = useFormContext();
  const fmbId = useWatch({ control, name: "fmbId" });
  const fmbTakhmeenId = useWatch({ control, name: "fmbTakhmeenId" });
  const { data: t } = useGetOne(
    "fmbTakhmeen",
    { id: fmbTakhmeenId },
    { enabled: Boolean(fmbId) && Boolean(fmbTakhmeenId) },
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

function PrefetchFmbItsDefaults({ prefFmbId }) {
  const { setValue, getValues } = useFormContext();
  const { data: fmb } = useGetOne("fmbData", { id: prefFmbId }, { enabled: Boolean(prefFmbId) });
  const didPrefillRef = useRef(false);

  useEffect(() => {
    if (didPrefillRef.current) return;
    const raw = fmb?.itsNo;
    if (raw == null || raw === "") return;
    const hofIts = String(raw).trim();
    if (!hofIts) return;
    const current = getValues("beneficiaryItsNo");
    if (current != null && String(current).trim() !== "") {
      didPrefillRef.current = true;
      return;
    }
    setValue("beneficiaryItsNo", hofIts, { shouldDirty: false, shouldTouch: false });
    didPrefillRef.current = true;
  }, [fmb, prefFmbId, getValues, setValue]);

  return null;
}

function UnitAmountDefaultInitializer({ defaultUnitAmount }) {
  const { getValues, setValue } = useFormContext();

  useEffect(() => {
    if (defaultUnitAmount == null) return;
    const currentUnitAmount = getValues("unitAmount");
    const isCurrentEmpty =
      currentUnitAmount === undefined || currentUnitAmount === null || currentUnitAmount === "";

    if (isCurrentEmpty) {
      setValue("unitAmount", defaultUnitAmount, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [defaultUnitAmount, getValues, setValue]);

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
