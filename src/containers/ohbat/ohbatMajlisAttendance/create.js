import React from "react";
import { Create, SimpleForm, TextInput } from "react-admin";
import { useSearchParams } from "react-router-dom";

const OhbatMajlisAttendanceCreate = () => {
  const [sp] = useSearchParams();
  const presetMajlisId = sp.get("ohbatMajalisId") || "";

  return (
    <Create redirect="list">
      <SimpleForm defaultValues={{ ohbatMajalisId: presetMajlisId || undefined, attendeeIts: "" }}>
        <TextInput
          source="ohbatMajalisId"
          label="Ohbat majlis id"
          fullWidth
          helperText="Pre-filled when opened from Upcoming list"
        />
        <TextInput source="attendeeIts" label="Attendee ITS" fullWidth />
      </SimpleForm>
    </Create>
  );
};

export default OhbatMajlisAttendanceCreate;
