import React from "react";
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  ReferenceField,
  ReferenceInput,
  AutocompleteInput,
  SelectInput,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const contributionTypeChoices = [
  { id: "ZABIHAT", name: "Zabihat" },
  { id: "VOLUNTARY", name: "Voluntary" },
];

export default function FmbContributionsList() {
  const filters = [
    <ReferenceInput source="fmbId" reference="fmbData" key="fmbId" alwaysOn>
      <AutocompleteInput
        fullWidth
        optionText={(choice) => `${choice.itsNo}`}
        shouldRenderSuggestions={(val) => val.trim().length === 8}
        noOptionsText="Enter valid HOF ITS No."
        label="Search by HOF ITS..."
        sx={{ minWidth: 300 }}
      />
    </ReferenceInput>,
    <SelectInput
      source="contributionType"
      key="contributionType"
      alwaysOn
      choices={contributionTypeChoices}
      label="Type"
      sx={{ minWidth: 180 }}
    />,
  ];

  return (
    <List
      sort={{ field: "createdAt", order: "DESC" }}
      filters={filters}
      perPage={25}
      title="FMB Contributions"
    >
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <ReferenceField source="fmbId" reference="fmbData" label="HOF ITS" link="show">
          <TextField source="itsNo" />
        </ReferenceField>
        <ReferenceField source="fmbId" reference="fmbData" label="HOF ITS">
          <TextField source="name" label="Name" />
        </ReferenceField>
        <TextField source="contributionType" label="Type" />
        <FunctionField
          label="Hijri period"
          render={(record) => formatFmbHijriPeriod(record?.hijriYearStart) ?? "—"}
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
        <DateField source="createdAt" showTime />
      </Datagrid>
    </List>
  );
}
