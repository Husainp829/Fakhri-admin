import React, { useCallback, useEffect, useState } from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  ReferenceInput,
  DateInput,
  AutocompleteInput,
  useDataProvider,
  Toolbar,
  SaveButton,
  required,
  type CreateProps,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { FmbHouseholdItsAutocomplete } from "../common/FmbHouseholdItsAutocomplete";
import { ThaliFieldsInput, mapThaliRowForApi } from "../common/ThaliFieldsInput";
import { validateThalis } from "../common/thali-map";
import { useItsNoInItsdata } from "../common/useItsNoInItsdata";
import { formatFmbHijriPeriod, getFmbTakhmeenYearFromGregorian } from "@/utils/hijri-date-utils";

const DUPLICATE_ITS_ERROR = "An FMB record already exists for this ITS.";
const ITS_MIN_LEN_FOR_DUP_CHECK = 5;

function normalizeIts(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function looksLikeItsComplete(value: unknown): boolean {
  const its = normalizeIts(value);
  if (!its) return false;
  if (!/^\d+$/.test(its)) return false;
  return its.length >= ITS_MIN_LEN_FOR_DUP_CHECK;
}

function normalizeString(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

const transform = (data: Record<string, unknown>) => {
  const next = { ...data };
  if (!next.deliveryScheduleProfileId) {
    delete next.deliveryScheduleProfileId;
  }

  if (next.takhmeenAmount == null && next.takhmeen != null) {
    next.takhmeenAmount = next.takhmeen;
  }
  delete next.takhmeen;

  if (next.hijriYearStart == null || next.hijriYearStart === "") {
    next.hijriYearStart = getFmbTakhmeenYearFromGregorian(new Date());
  }
  if (next.takhmeenAmount != null && next.takhmeenAmount !== "") {
    next.takhmeenAmount = Number(next.takhmeenAmount);
  }

  if (next.whatsappNo != null && normalizeString(next.whatsappNo) === "") {
    delete next.whatsappNo;
  }

  if (Array.isArray(next.thalis)) {
    next.thalis = next.thalis
      .filter((thali: { thaliNo?: string }) => thali?.thaliNo && String(thali.thaliNo).trim())
      .map((thali: Record<string, unknown>) => mapThaliRowForApi(thali, { isCreate: true }));
  }
  return next;
};

type ItsDirectoryGate = {
  checkingDirectory: boolean;
  /** ITS confirmed absent from itsdata — require manual household + delivery fields */
  offDirectory: boolean;
};

function DirectoryGateReporter({ onGate }: { onGate: (g: ItsDirectoryGate) => void }) {
  const itsNo = useWatch({ name: "itsNo" });
  const { inDirectory, checking } = useItsNoInItsdata(itsNo);

  useEffect(() => {
    const its = normalizeIts(itsNo);
    if (!looksLikeItsComplete(its)) {
      onGate({ checkingDirectory: false, offDirectory: false });
      return;
    }
    if (checking) {
      onGate({ checkingDirectory: true, offDirectory: false });
      return;
    }
    onGate({
      checkingDirectory: false,
      offDirectory: inDirectory === false,
    });
  }, [itsNo, inDirectory, checking, onGate]);

  return null;
}

export default function FmbDataCreate(props: CreateProps) {
  const dataProvider = useDataProvider();
  const resultCacheRef = React.useRef(new Map<string, boolean>());
  const inFlightRef = React.useRef(new Map<string, Promise<boolean>>());
  const hijriYearStart = React.useMemo(() => getFmbTakhmeenYearFromGregorian(new Date()), []);
  const [gate, setGate] = useState<ItsDirectoryGate>({
    checkingDirectory: false,
    offDirectory: false,
  });

  const onGate = useCallback((g: ItsDirectoryGate) => {
    setGate((prev) =>
      prev.checkingDirectory === g.checkingDirectory && prev.offDirectory === g.offDirectory
        ? prev
        : g
    );
  }, []);

  const validateManualHouseholdWhenOffDirectory = useCallback(
    (values: Record<string, unknown>) => {
      const errors: Record<string, string> = {};
      if (!gate.offDirectory) {
        return errors;
      }
      if (!normalizeString(values.name)) {
        errors.name = "Required when ITS is not in the ITS directory";
      }
      if (!normalizeString(values.mobileNo)) {
        errors.mobileNo = "Required when ITS is not in the ITS directory";
      }
      const thalis = values.thalis;
      const thaliErr = validateThalis(thalis);
      if (thaliErr) {
        errors.thalis = thaliErr;
        return errors;
      }
      if (Array.isArray(thalis)) {
        const missingAddr = thalis.some(
          (t) => !normalizeString((t as { deliveryAddress?: string })?.deliveryAddress)
        );
        if (missingAddr) {
          errors.thalis =
            "Each thali must have a delivery address when ITS is not in the ITS directory";
        }
      }
      return errors;
    },
    [gate.offDirectory]
  );

  function CreateToolbar() {
    const { formState } = useFormContext();
    const itsNo = useWatch({ name: "itsNo" });
    const hasItsError = Boolean(formState?.errors?.itsNo);
    const waitDirectoryCheck = looksLikeItsComplete(itsNo) && gate.checkingDirectory;
    return (
      <Toolbar>
        <SaveButton disabled={hasItsError || waitDirectoryCheck} />
      </Toolbar>
    );
  }

  const checkItsDuplicate = useCallback(
    async (its: string) => {
      if (resultCacheRef.current.has(its)) {
        return resultCacheRef.current.get(its)!;
      }
      if (inFlightRef.current.has(its)) {
        return inFlightRef.current.get(its)!;
      }

      const promise = (async () => {
        const res = await dataProvider.getList("fmbData", {
          pagination: { page: 1, perPage: 10 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { search: its, includeClosed: true },
        });

        const rows = Array.isArray(res?.data) ? res.data : [];
        return rows.some((r: { itsNo?: string }) => normalizeIts(r?.itsNo) === its);
      })();

      inFlightRef.current.set(its, promise);
      const isDuplicate = await promise;
      inFlightRef.current.delete(its);
      resultCacheRef.current.set(its, isDuplicate);
      return isDuplicate;
    },
    [dataProvider]
  );

  const validateItsNo = useCallback(
    async (value: unknown) => {
      const its = normalizeIts(value);
      if (!its) return "Required";

      if (!looksLikeItsComplete(its)) return undefined;

      if (resultCacheRef.current.has(its)) {
        return resultCacheRef.current.get(its) ? DUPLICATE_ITS_ERROR : undefined;
      }

      try {
        const isDuplicate = await checkItsDuplicate(its);
        return isDuplicate ? DUPLICATE_ITS_ERROR : undefined;
      } catch {
        inFlightRef.current.delete(its);
        return undefined;
      }
    },
    [checkItsDuplicate]
  );

  function ItsDuplicateGuard() {
    const { setError, clearErrors } = useFormContext();
    const itsNo = useWatch({ name: "itsNo" });

    React.useEffect(() => {
      const its = normalizeIts(itsNo);
      if (!its || !looksLikeItsComplete(its)) {
        clearErrors("itsNo");
        return undefined;
      }

      let alive = true;
      (async () => {
        try {
          const isDuplicate = await checkItsDuplicate(its);
          if (!alive) return;
          if (isDuplicate) {
            setError("itsNo", { type: "validate", message: DUPLICATE_ITS_ERROR });
          } else {
            clearErrors("itsNo");
          }
        } catch {
          // don't block user if the check fails
        }
      })();

      return () => {
        alive = false;
      };
    }, [itsNo, setError, clearErrors, checkItsDuplicate]);

    return null;
  }

  return (
    <Create {...props} transform={transform}>
      <SimpleForm
        warnWhenUnsavedChanges
        sx={{ maxWidth: 700 }}
        toolbar={<CreateToolbar />}
        validate={validateManualHouseholdWhenOffDirectory}
      >
        <DirectoryGateReporter onGate={onGate} />
        <ItsDuplicateGuard />
        <Grid container spacing={1}>
          <Grid size={12}>
            <FmbHouseholdItsAutocomplete debounce={300} validate={[required(), validateItsNo]} />
          </Grid>
          {gate.offDirectory ? (
            <Grid size={12}>
              <Alert severity="info">
                This ITS is not in your directory. Enter the account name, contact numbers, and each
                thali&apos;s delivery address and mohallah manually (they are not copied from ITS
                data).
              </Alert>
            </Grid>
          ) : null}
          <Grid size={12}>
            <TextInput
              source="name"
              label="Name"
              fullWidth
              helperText={
                gate.offDirectory
                  ? "Required — not available from ITS directory."
                  : "Optional — prefilled when you pick an ITS from the directory."
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <TextInput
              source="mobileNo"
              label="Mobile"
              fullWidth
              helperText={
                gate.offDirectory ? "Required — not available from ITS directory." : undefined
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <TextInput source="whatsappNo" label="WhatsApp" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <TextInput source="pan" label="PAN" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label={`Takhmeen Amount (${formatFmbHijriPeriod(hijriYearStart, null) ?? "—"})`}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <DateInput source="lastPaidDate" fullWidth />
          </Grid>
          <Grid size={12}>
            <TextInput source="remarks" label="Remarks" fullWidth minRows={3} multiline />
          </Grid>
          <Grid size={12}>
            <ReferenceInput
              source="deliveryScheduleProfileId"
              reference="fmbDeliveryScheduleProfile"
              perPage={100}
              label="Delivery schedule profile"
            >
              <AutocompleteInput
                optionText={(r) => `${r.code} — ${r.name}`}
                fullWidth
                debounce={300}
                helperText="Optional — defaults to tenant DEFAULT profile when omitted"
              />
            </ReferenceInput>
          </Grid>
          <Grid size={12}>
            <ThaliFieldsInput />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
}
