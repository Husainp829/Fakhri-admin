import {
  Datagrid,
  DateField,
  NumberField,
  ReferenceManyField,
  TextField,
  FunctionField,
  Button,
  useRedirect,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

export default function ContributionsTab() {
  const redirect = useRedirect();

  return (
    <ReferenceManyField
      reference="fmbContributions"
      target="fmbId"
      label={false}
      perPage={25}
      sort={{ field: "createdAt", order: "DESC" }}
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="contributionType" label="Type" />
        <FunctionField
          label="Hijri period"
          render={(record) => formatFmbHijriPeriod(record?.hijriYearStart, null) ?? "—"}
        />
        <TextField source="beneficiaryItsNo" label="Beneficiary ITS" />
        <NumberField source="quantity" />
        <FunctionField
          label="Unit amount"
          textAlign="right"
          render={(record) => formatINR(record?.unitAmount, { empty: "—" })}
        />
        <FunctionField
          label="Amount"
          textAlign="right"
          render={(record) => formatINR(record?.amount, { empty: "—" })}
        />
        <FunctionField
          label="Pending"
          textAlign="right"
          render={(record) => formatINR(record?.contributionPendingAmount, { empty: "—" })}
        />
        <DateField source="createdAt" showTime />
        <FunctionField
          label="Add payment"
          render={(record) => {
            const pending = Number(record?.contributionPendingAmount || 0);
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
                  redirect(
                    `/fmbReceipt/create?fmbId=${record?.fmbId}&fmbContributionId=${record?.id}&target=CONTRIBUTION`
                  );
                }}
                label="Add payment"
              />
            );
          }}
        />
      </Datagrid>
    </ReferenceManyField>
  );
}
