import { useEffect } from "react";
import {
  TextInput,
  DateInput,
  RadioButtonGroupInput,
  useNotify,
  minValue,
  maxValue,
  required,
  useStore,
} from "react-admin";
import Grid from "@mui/material/Grid";
import { useWatch, useFormContext } from "react-hook-form";
import NoArrowKeyNumberInput from "@/components/NoArrowKeyNumberInput";
import { callApi } from "@/dataprovider/misc-apis";
import { calcTotalPayable } from "@/utils";
import type { CurrentEvent } from "@/containers/events/types";
import type { NiyaazPayableData } from "@/utils/app-formatters";

type NiyaazRow = NiyaazPayableData & {
  HOFId?: string;
  HOFName?: string;
  formNo?: string;
  markaz?: string;
  namaazVenue?: string;
  paidAmount?: number;
};

function isNiyaazListPayload(data: unknown): data is { count: number; rows: NiyaazRow[] } {
  if (data == null || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.count === "number" && Array.isArray(d.rows);
}

type ReceiptCreateFormProps = { niyaazId: string | null };

export const ReceiptCreateForm = ({ niyaazId }: ReceiptCreateFormProps) => {
  const notify = useNotify();

  const { setValue } = useFormContext();
  const amount = useWatch({ name: "amount" });
  const totalPayable = useWatch({ name: "totalPayable" });
  const paidAmount = useWatch({ name: "paidAmount" });
  const [currentEvent] = useStore<CurrentEvent | null>("currentEvent");

  useEffect(() => {
    const getNiyaaz = () => {
      if (!niyaazId) return;
      callApi({ location: "niyaaz", method: "GET", id: niyaazId })
        .then(({ data: raw }) => {
          if (!isNiyaazListPayload(raw)) return;
          if (raw.count > 0) {
            const niyaazData = raw.rows[0] ?? {};
            setValue("HOFId", niyaazData.HOFId);
            setValue("HOFName", niyaazData.HOFName);
            setValue("formNo", niyaazData.formNo);
            setValue("markaz", niyaazData.markaz);
            setValue("namaazVenue", niyaazData.namaazVenue);
            const payable = calcTotalPayable(currentEvent ?? {}, niyaazData);
            setValue("totalPayable", payable);
            setValue("paidAmount", niyaazData.paidAmount);
            setValue("balancePending", payable - (Number(niyaazData.paidAmount) || 0));
          }
        })
        .catch((err: Error) => {
          notify(err.message, { type: "warning" });
        });
    };
    if (niyaazId && currentEvent?.name) {
      getNiyaaz();
    }
  }, [niyaazId, currentEvent, notify, setValue]);

  useEffect(() => {
    const tp = Number(totalPayable) || 0;
    const pa = Number(paidAmount) || 0;
    const am = Number(amount) || 0;
    let balance = tp - pa;
    if (am > balance) {
      balance = 0;
    } else {
      balance -= am;
    }
    setValue("balancePending", balance);
  }, [amount, totalPayable, paidAmount, setValue]);

  const tp = Number(totalPayable) || 0;
  const pa = Number(paidAmount) || 0;
  const validateAmount = [
    required(),
    maxValue(tp - pa, `Amount cannot be greater than ${tp - pa}`),
    minValue(0, "Min value is 1"),
  ];

  return (
    <>
      <Grid container spacing={1}>
        <Grid
          size={{
            lg: 6,
            xs: 6,
          }}
        >
          <TextInput
            source="HOFId"
            label="HOF ITS"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            lg: 6,
            xs: 6,
          }}
        >
          <TextInput
            source="formNo"
            label="Form No."
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            lg: 6,
            xs: 6,
          }}
        >
          <TextInput
            source="markaz"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            lg: 6,
            xs: 6,
          }}
        >
          <TextInput
            source="namaazVenue"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            lg: 6,
            xs: 6,
          }}
        >
          <TextInput
            source="HOFName"
            label="Name"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <NoArrowKeyNumberInput
            source="totalPayable"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <NoArrowKeyNumberInput source="amount" fullWidth validate={validateAmount} />
        </Grid>
        <Grid
          size={{
            lg: 6,
            xs: 6,
          }}
        >
          <DateInput
            source="date"
            fullWidth
            defaultValue={new Date()}
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
          <NoArrowKeyNumberInput
            source="balancePending"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
      </Grid>
      <RadioButtonGroupInput
        sx={{ mt: 0 }}
        source="mode"
        choices={[
          { id: "CASH", name: "CASH" },
          { id: "ONLINE", name: "ONLINE" },
          { id: "CHEQUE", name: "CHEQUE" },
        ]}
        fullWidth
      />
      <TextInput source="details" fullWidth multiline />
    </>
  );
};
