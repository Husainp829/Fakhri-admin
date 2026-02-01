import React from "react";
import { Show, SimpleShowLayout, TabbedShowLayout, TextField, DateField } from "react-admin";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMediaQuery } from "@mui/material";

const layoutSx = {
  maxWidth: "100%",
  "& .RaSimpleShowLayout-stack": {
    maxWidth: "100%",
    "@media (min-width: 600px)": {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px 24px",
    },
  },
  "& .MuiTypography-root": { wordBreak: "break-word", overflowWrap: "break-word" },
};

const Section = ({ title, children }) => (
  <Box>
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 600,
        color: "primary.main",
        p: 2,
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const PersonalSection = () => (
  <SimpleShowLayout sx={layoutSx}>
    <TextField source="id" label="ITS" />
    <TextField source="HOF_FM_TYPE" label="Type" />
    <TextField source="HOF_ID" label="HOF ITS" />
    <TextField source="Full_Name" label="Full Name" />
    <TextField source="Age" />
    <TextField source="Gender" />
    <TextField source="Marital_Status" label="Marital Status" emptyText="-" />
    <TextField source="Blood_Group" label="Blood Group" emptyText="-" />
    <TextField source="Misaq" emptyText="-" />
    <TextField source="Warakatul_Tarkhis" label="Warakatul Tarkhis" emptyText="-" />
  </SimpleShowLayout>
);

const ContactLocationSection = () => (
  <SimpleShowLayout sx={layoutSx}>
    <TextField source="Mobile" emptyText="-" />
    <TextField source="Email" emptyText="-" />
    <TextField source="Address" emptyText="-" />
    <TextField source="Sector" emptyText="-" />
    <TextField source="Sub_Sector" label="Sub Sector" emptyText="-" />
  </SimpleShowLayout>
);

const OrganisationSection = () => (
  <SimpleShowLayout sx={layoutSx}>
    <TextField source="Idara" emptyText="-" />
    <TextField source="Organisation" emptyText="-" />
    <TextField source="Vatan" emptyText="-" />
    <TextField source="Nationality" emptyText="-" />
    <TextField source="Qadambosi_Sharaf" emptyText="-" />
    <TextField source="Raudat_Tahera_Ziyarat" emptyText="-" />
    <TextField source="Karbala_Ziyarat" emptyText="-" />
    <TextField source="Ashara_Mubaraka" emptyText="-" />
  </SimpleShowLayout>
);

const HousingSection = () => (
  <SimpleShowLayout sx={layoutSx}>
    <TextField source="Housing" emptyText="-" />
    <TextField source="Type_of_House" label="Type of House" emptyText="-" />
    <TextField source="Data_Verifcation_Status" label="Data Verification" emptyText="-" />
    <TextField source="Photo_Verifcation_Status" label="Photo Verification" emptyText="-" />
    <DateField source="updatedAt" label="Last Updated" showTime />
  </SimpleShowLayout>
);

export default (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"), { noSsr: true });

  return (
    <Show
      {...props}
      sx={{
        "& .RaShow-main": {
          maxWidth: "100%",
          overflow: "hidden",
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
        },
      }}
    >
      <Box sx={{ maxWidth: "100%", overflow: "hidden" }}>
        {isSmall ? (
          <>
            <Section title="Personal">
              <PersonalSection />
            </Section>
            <Section title="Contact & Location">
              <ContactLocationSection />
            </Section>
            <Section title="Organisation & Ziyarat">
              <OrganisationSection />
            </Section>
            <Section title="Housing & Verification">
              <HousingSection />
            </Section>
          </>
        ) : (
          <TabbedShowLayout
            sx={{
              "& .RaTabbedShowLayout-content": { maxWidth: "100%", overflow: "hidden" },
            }}
          >
            <TabbedShowLayout.Tab label="Personal" path="personal">
              <PersonalSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Contact & Location" path="contact">
              <ContactLocationSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Organisation & Ziyarat" path="organisation">
              <OrganisationSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Housing & Verification" path="housing">
              <HousingSection />
            </TabbedShowLayout.Tab>
          </TabbedShowLayout>
        )}
      </Box>
    </Show>
  );
};
