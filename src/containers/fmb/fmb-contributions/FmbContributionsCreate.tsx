import React, { useEffect, useMemo, useRef, useState } from "react";
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
  useGetOne,
  minValue,
  type CreateProps,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import httpClient from "@/dataprovider/http-client";
import { getApiUrl } from "@/constants";
import { ITSInput } from "./common/FmbContributionsItsInput";
import { BeneficiaryItsAutocomplete } from "./common/BeneficiaryItsAutocomplete";
import { formatINR } from "@/utils";
import {
  validateBeneficiaryDisplayName,
  validateContributionFmbOrPeriod,
  validatePositiveContributionTotal,
} from "./common/contribution-form-validators";
import { SeedOverrideAmountFromCalculated } from "./common/seed-override-amount-from-calculated";

const TYPE_CHOICES = [
  { id: "ZABIHAT", name: "Zabihat" },
  { id: "VOLUNTARY", name: "Voluntary" },
];

const transform = (data: Record<string, unknown>) => {
  const out: Record<string, unknown> = {
    contributionType: data.contributionType,
    beneficiaryItsNo:
      typeof data.beneficiaryItsNo === "string"
        ? data.beneficiaryItsNo.trim()
        : data.beneficiaryItsNo,
    quantity: Number(data.quantity),
    isAmountOverridden: data.isAmountOverridden === true,
    remarks:
      typeof data.remarks === "string"
        ? data.remarks.trim() || undefined
        : (data.remarks ?? undefined),
  };
  if (typeof data.beneficiaryName === "string") {
    const bn = data.beneficiaryName.trim();
    if (bn) {
      out.beneficiaryName = bn;
    }
  }

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

function validateContributionForm(values: Record<string, unknown>) {
  return {
    ...validateContributionFmbOrPeriod(values),
    ...validateBeneficiaryDisplayName(values),
    ...validatePositiveContributionTotal(values),
  };
}

export default function FmbContributionsCreate(props: CreateProps) {
  const [searchParams] = useSearchParams();
  const prefFmbId = searchParams.get("fmbId") || "";
  const [defaultUnitAmount, setDefaultUnitAmount] = useState<number | undefined>(undefined);

  useEffect(() => {
    httpClient(`${getApiUrl()}/fmbThaliSettings`)
      .then((res) => {
        const json = res.json as { rows?: { zabihatUnitAmount?: number }[] };
        setDefaultUnitAmount(json?.rows?.[0]?.zabihatUnitAmount);
      })
      .catch(() => {});
  }, []);

  const defaultValues = useMemo(
    () => ({
      fmbId: prefFmbId || undefined,
      contributionType: "ZABIHAT",
      quantity: 1,
      isAmountOverridden: false,
    }),
    [prefFmbId]
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
          <Grid size={12}>
            <ReferenceInput source="fmbId" reference="fmbData" perPage={100}>
              <ITSInput
                label="FMB record (optional)"
                optionText={(r) => `${r.fileNo ?? "—"} · ITS ${r.itsNo ?? "—"}`}
                fullWidth
                debounce={300}
                filterToQuery={(q) => ({ search: q })}
                helperText={false}
              />
            </ReferenceInput>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput source="name" label="Account name" fullWidth disabled />
          </Grid>
          <FormDataConsumer>
            {({ formData }) =>
              formData?.fmbId ? (
                <Grid size={12}>
                  <ReferenceInput
                    source="fmbTakhmeenId"
                    reference="fmbTakhmeen"
                    filter={{ fmbId: formData.fmbId }}
                    perPage={200}
                    helperText={false}
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
                      shouldRenderSuggestions={(val: string) => val.trim().length >= 0}
                      noOptionsText="No annual periods for this FMB"
                      helperText={false}
                    />
                  </ReferenceInput>
                </Grid>
              ) : null
            }
          </FormDataConsumer>
          <Grid size={{ xs: 12, sm: 3 }}>
            <SelectInput
              source="contributionType"
              label="Contribution type"
              choices={TYPE_CHOICES}
              fullWidth
              validate={[required()]}
              helperText={false}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <NoArrowKeyNumberInput
              source="hijriYearStart"
              label="Hijri year start"
              fullWidth
              helperText="Required if no FMB record"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <BeneficiaryItsAutocomplete />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextInput
              source="beneficiaryName"
              label="Beneficiary name"
              fullWidth
              helperText="Auto-filled from ITS directory when available. Enter manually if ITS is not in directory."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <NoArrowKeyNumberInput
              source="quantity"
              label="Quantity"
              fullWidth
              validate={[required(), minValue(1)]}
              helperText={false}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <NoArrowKeyNumberInput
              source="unitAmount"
              label="Unit amount"
              fullWidth
              helperText={false}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CalculatedTotalAmountField />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <BooleanInput
              source="isAmountOverridden"
              label="Override total amount"
              helperText={false}
            />
          </Grid>
          <FormDataConsumer>
            {({ formData }) =>
              formData?.isAmountOverridden ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <NoArrowKeyNumberInput
                    source="amount"
                    label="Amount (override)"
                    fullWidth
                    validate={[required(), minValue(1)]}
                    helperText={false}
                  />
                </Grid>
              ) : null
            }
          </FormDataConsumer>
          <Grid size={12}>
            <TextInput source="remarks" fullWidth multiline minRows={3} />
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

function PrefetchFmbItsDefaults({ prefFmbId }: { prefFmbId: string }) {
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
    const accountName =
      fmb?.name != null && String(fmb.name).trim() !== "" ? String(fmb.name).trim() : "";
    const currentBn = getValues("beneficiaryName");
    if (accountName && (currentBn == null || String(currentBn).trim() === "")) {
      setValue("beneficiaryName", accountName, { shouldDirty: false, shouldTouch: false });
    }
    didPrefillRef.current = true;
  }, [fmb, prefFmbId, getValues, setValue]);

  return null;
}

function UnitAmountDefaultInitializer({ defaultUnitAmount }: { defaultUnitAmount?: number }) {
  const { getValues, setValue, control } = useFormContext();
  const contributionType = useWatch({ control, name: "contributionType" });

  useEffect(() => {
    if (defaultUnitAmount == null) return;
    if (contributionType !== "ZABIHAT") return;
    const currentUnitAmount = getValues("unitAmount");
    const isCurrentEmpty =
      currentUnitAmount === undefined ||
      currentUnitAmount === null ||
      currentUnitAmount === "" ||
      Number(currentUnitAmount) === 0;

    if (isCurrentEmpty) {
      setValue("unitAmount", defaultUnitAmount, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [contributionType, defaultUnitAmount, getValues, setValue]);

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
