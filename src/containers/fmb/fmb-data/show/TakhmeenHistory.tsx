import {
  Button,
  Datagrid,
  FunctionField,
  ReferenceField,
  ReferenceManyField,
  TextField,
  useRedirect,
  type RaRecord,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatListDate } from "@/utils/date-format";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

export default function TakhmeenHistory() {
  const redirect = useRedirect();

  return (
    <ReferenceManyField reference="fmbTakhmeen" target="fmbId" label={false}>
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <FunctionField
          label="Amount"
          textAlign="right"
          render={(record) => formatINR(record?.takhmeenAmount, { empty: "—" })}
        />
        <FunctionField
          label="Hijri period"
          render={(record) =>
            formatFmbHijriPeriod(record?.hijriYearStart, record?.hijriYearEnd) ?? "—"
          }
        />
        <FunctionField
          label="Pending"
          textAlign="right"
          render={(record) => formatINR(record?.pendingBalance, { empty: "—" })}
        />
        <FunctionField
          label="Paid"
          textAlign="right"
          render={(record) => formatINR(record?.paidBalance, { empty: "—" })}
        />
        <ReferenceField source="updatedBy" reference="admins">
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          label="Effective"
          sortBy="startDate"
          render={(record: RaRecord) => formatListDate(record?.startDate, { empty: "—" })}
        />
        <FunctionField
          label="Add Payment"
          source="fmbId"
          render={(record) => {
            const pending = Number(record?.pendingBalance || 0);
            if (pending <= 0) {
              return null;
            }
            return (
              <Button
                type="button"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  redirect(`/fmbReceipt/create?fmbId=${record?.fmbId}&fmbTakhmeenId=${record?.id}`);
                }}
                label="Add Payment"
              />
            );
          }}
        />
      </Datagrid>
    </ReferenceManyField>
  );
}
