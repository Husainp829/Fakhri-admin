import { ArrayField, Datagrid, SimpleList, TextField } from "react-admin";
import Box from "@mui/material/Box";
import { useMediaQuery } from "@mui/material";

export const NiyaazShowFamilyMembers = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });
  return (
    <ArrayField source="familyMembers">
      {isSmall ? (
        <SimpleList
          primaryText={(record) => String(record.name)}
          secondaryText={(record) =>
            `${record.age} yrs · ${record.its || "—"} · ${record.gender || "—"}`
          }
          linkType={false}
          rowSx={() => ({ borderBottom: 1, borderBottomColor: "divider" })}
        />
      ) : (
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Datagrid bulkActionButtons={false} sx={{ minWidth: 500 }}>
            <TextField source="name" />
            <TextField source="age" />
            <TextField source="its" label="ITS" />
            <TextField source="gender" />
          </Datagrid>
        </Box>
      )}
    </ArrayField>
  );
};
