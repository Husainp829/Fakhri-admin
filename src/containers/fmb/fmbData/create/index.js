import React from "react";
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
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import Grid from "@mui/material/GridLegacy";
import NoArrowKeyNumberInput from "../../../../components/NoArrowKeyNumberInput";

import { ITSInput } from "../common/itsInput";
import { ThaliFieldsInput, mapThaliRowForApi } from "../common/thaliFields";
import {
  formatFmbHijriPeriod,
  getFmbTakhmeenYearFromGregorian,
} from "../../../../utils/hijriDateUtils";

const DUPLICATE_ITS_ERROR = "An FMB record already exists for this ITS.";
const ITS_MIN_LEN_FOR_DUP_CHECK = 5;

function normalizeIts(value) {
  if (value == null) return "";
  return String(value).trim();
}

function looksLikeItsComplete(value) {
  const its = normalizeIts(value);
  if (!its) return false;
  // ITS is numeric in practice; avoid spamming the API for partial / non-numeric searches
  if (!/^\d+$/.test(its)) return false;
  return its.length >= ITS_MIN_LEN_FOR_DUP_CHECK;
}

const transform = (data) => {
  const next = { ...data };
  if (!next.deliveryScheduleProfileId) {
    delete next.deliveryScheduleProfileId;
  }

  // Back-compat: old UI used `takhmeen`; API expects `takhmeenAmount` + `takhmeenYear`.
  if (next.takhmeenAmount == null && next.takhmeen != null) {
    next.takhmeenAmount = next.takhmeen;
  }
  delete next.takhmeen;

  if (next.takhmeenYear == null || next.takhmeenYear === "") {
    next.takhmeenYear = getFmbTakhmeenYearFromGregorian(new Date());
  }
  if (next.takhmeenAmount != null && next.takhmeenAmount !== "") {
    next.takhmeenAmount = Number(next.takhmeenAmount);
  }

  if (Array.isArray(next.thalis)) {
    next.thalis = next.thalis
      .filter((thali) => thali?.thaliNo && String(thali.thaliNo).trim())
      .map((thali) => mapThaliRowForApi(thali, { isCreate: true }));
  }
  return next;
};

export default function FmbDataCreate(props) {
  const dataProvider = useDataProvider();
  const resultCacheRef = React.useRef(new Map()); // its -> boolean (duplicate?)
  const inFlightRef = React.useRef(new Map()); // its -> Promise<boolean>
  const takhmeenYear = React.useMemo(() => getFmbTakhmeenYearFromGregorian(new Date()), []);

  function CreateToolbar() {
    const { formState } = useFormContext();
    const hasItsError = Boolean(formState?.errors?.itsNo);
    return (
      <Toolbar>
        <SaveButton disabled={hasItsError} />
      </Toolbar>
    );
  }

  const checkItsDuplicate = React.useCallback(
    async (its) => {
      if (resultCacheRef.current.has(its)) {
        return resultCacheRef.current.get(its);
      }
      if (inFlightRef.current.has(its)) {
        return inFlightRef.current.get(its);
      }

      const promise = (async () => {
        const res = await dataProvider.getList("fmbData", {
          pagination: { page: 1, perPage: 10 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { search: its, includeClosed: true },
        });

        const rows = Array.isArray(res?.data) ? res.data : [];
        return rows.some((r) => normalizeIts(r?.itsNo) === its);
      })();

      inFlightRef.current.set(its, promise);
      const isDuplicate = await promise;
      inFlightRef.current.delete(its);
      resultCacheRef.current.set(its, isDuplicate);
      return isDuplicate;
    },
    [dataProvider],
  );

  const validateItsNo = React.useCallback(
    async (value) => {
      const its = normalizeIts(value);
      if (!its) return "Required";

      // Only run the duplicate check when ITS looks "complete" to reduce API calls while typing.
      if (!looksLikeItsComplete(its)) return undefined;

      if (resultCacheRef.current.has(its)) {
        return resultCacheRef.current.get(its) ? DUPLICATE_ITS_ERROR : undefined;
      }

      try {
        const isDuplicate = await checkItsDuplicate(its);
        return isDuplicate ? DUPLICATE_ITS_ERROR : undefined;
      } catch (e) {
        // If the check fails (network/auth), don't block create; rely on server-side safeguards.
        inFlightRef.current.delete(its);
        return undefined;
      }
    },
    [checkItsDuplicate],
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
    }, [itsNo, setError, clearErrors]);

    return null;
  }

  return (
    <Create {...props} transform={transform}>
      <SimpleForm warnWhenUnsavedChanges sx={{ maxWidth: 700 }} toolbar={<CreateToolbar />}>
        <ItsDuplicateGuard />
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <ReferenceInput source="itsNo" reference="itsData" required>
              <ITSInput
                label="ITS No."
                debounce={300}
                fullWidth
                required
                validate={validateItsNo}
                optionText={(r) => `${r.ITS_ID} · ${r.Full_Name}`}
              />
            </ReferenceInput>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <TextInput source="area" label="Area (ITS)" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <TextInput source="masool" label="Masool (ITS)" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <TextInput source="mobileNo" label="Mobile (ITS)" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <TextInput source="pan" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <NoArrowKeyNumberInput
              source="takhmeenAmount"
              label={`Takhmeen Amount (${formatFmbHijriPeriod(takhmeenYear)})`}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <DateInput source="lastPaidDate" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextInput source="remarks" label="Remarks" fullWidth minRows={3} multiline />
          </Grid>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
            <ThaliFieldsInput />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
}
