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
  TextInput,
  type ListProps,
} from "react-admin";
import { formatINR } from "@/utils";
import { formatFmbHijriPeriod } from "@/utils/hijri-date-utils";

const contributionTypeChoices = [
  { id: "ZABIHAT", name: "Zabihat" },
  { id: "VOLUNTARY", name: "Voluntary" },
];

export default function FmbContributionsList(_props: ListProps) {
  const filters = [
    <TextInput
      key="q"
      source="q"
      label="Search beneficiary or remarks"
      alwaysOn
      sx={{ minWidth: 260 }}
    />,
    <ReferenceInput source="fmbId" reference="fmbData" key="fmbId" alwaysOn>
      <AutocompleteInput
        fullWidth
        optionText={(choice) => `${choice.itsNo}`}
        shouldRenderSuggestions={(val: string) => val.trim().length === 8}
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
        <ReferenceField
          source="fmbId"
          reference="fmbData"
          label="HOF ITS"
          link="show"
          sortable={false}
        >
          <TextField source="itsNo" />
        </ReferenceField>
        <ReferenceField source="fmbId" reference="fmbData" label="HOF ITS" sortable={false}>
          <TextField source="name" label="Name" />
        </ReferenceField>
        <TextField source="contributionType" label="Type" />
        <FunctionField
          label="Hijri period"
          sortBy="hijriYearStart"
          render={(record) => formatFmbHijriPeriod(record?.hijriYearStart, null) ?? "—"}
        />
        <TextField source="beneficiaryItsNo" label="Beneficiary ITS" />
        <TextField source="beneficiaryName" label="Beneficiary name" emptyText="—" />
        <NumberField source="quantity" />
        <FunctionField
          label="Unit amount"
          textAlign="right"
          sortBy="unitAmount"
          render={(record) => formatINR(record?.unitAmount, { empty: "—" })}
        />
        <FunctionField
          label="Amount"
          textAlign="right"
          sortBy="amount"
          render={(record) => formatINR(record?.amount, { empty: "—" })}
        />
        <DateField source="createdAt" showTime />
      </Datagrid>
    </List>
  );
}
