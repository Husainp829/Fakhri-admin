import type { ComponentProps, ReactNode } from "react";
import { Show, SimpleShowLayout, TabbedShowLayout, TextField, DateField } from "react-admin";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMediaQuery } from "@mui/material";

/** Long / multi-line values span the full grid width from `sm` up (className is applied to `Labeled` by SimpleShowLayout). */
const FULL_ROW = "itsdata-field-full-width";

const layoutSx = {
  maxWidth: "100%",
  "& .RaSimpleShowLayout-stack": {
    maxWidth: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    columnGap: { xs: 0, sm: 3 },
    rowGap: { xs: 1.5, sm: 2 },
    "@media (min-width: 600px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 900px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
    "@media (min-width: 1536px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
  [`& .${FULL_ROW}`]: {
    gridColumn: { xs: "auto", sm: "1 / -1" },
  },
  "& .RaLabeled-root": { minWidth: 0, maxWidth: "100%" },
  "& .MuiTypography-root": { wordBreak: "break-word", overflowWrap: "break-word" },
};

const sectionStackProps = { sx: layoutSx, spacing: 0 };

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
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

/** All scalar itsdata fields aligned with Prisma model `Itsdata` */
const PersonalSection = () => (
  <SimpleShowLayout {...sectionStackProps}>
    <TextField source="tenantId" label="Tenant" emptyText="-" />
    <TextField source="id" label="Record ID" emptyText="-" />
    <TextField source="ITS_ID" label="ITS ID" emptyText="-" />
    <TextField source="HOF_FM_TYPE" label="Type" emptyText="-" />
    <TextField source="HOF_ID" label="HOF ITS" emptyText="-" />
    <TextField source="Family_ID" label="Family ID" emptyText="-" />
    <TextField source="Father_ITS_ID" label="Father ITS" emptyText="-" />
    <TextField source="Mother_ITS_ID" label="Mother ITS" emptyText="-" />
    <TextField source="Spouse_ITS_ID" label="Spouse ITS" emptyText="-" />
    <TextField source="TanzeemFile_No" label="Tanzeem File No." emptyText="-" />
    <TextField source="Full_Name" label="Full Name" emptyText="-" className={FULL_ROW} />
    <TextField
      source="Full_Name_Arabic"
      label="Full Name (Arabic)"
      emptyText="-"
      className={FULL_ROW}
    />
    <TextField source="First_Prefix" label="First Prefix" emptyText="-" />
    <TextField source="Prefix_Year" label="Prefix Year" emptyText="-" />
    <TextField source="First_Name" label="First Name" emptyText="-" />
    <TextField source="Father_Prefix" label="Father Prefix" emptyText="-" />
    <TextField source="Father_Name" label="Father Name" emptyText="-" />
    <TextField source="Father_Surname" label="Father Surname" emptyText="-" />
    <TextField source="Husband_Prefix" label="Husband Prefix" emptyText="-" />
    <TextField source="Husband_Name" label="Husband Name" emptyText="-" />
    <TextField source="Surname" emptyText="-" />
    <TextField source="Age" emptyText="-" />
    <TextField source="Gender" emptyText="-" />
    <TextField source="Misaq" emptyText="-" />
    <TextField source="Marital_Status" label="Marital Status" emptyText="-" />
    <TextField source="Blood_Group" label="Blood Group" emptyText="-" />
    <TextField source="Warakatul_Tarkhis" label="Warakatul Tarkhis" emptyText="-" />
    <TextField source="Date_Of_Nikah" label="Date Of Nikah" emptyText="-" />
    <TextField source="Date_Of_Nikah_Hijri" label="Date Of Nikah (Hijri)" emptyText="-" />
  </SimpleShowLayout>
);

const ContactWorkSection = () => (
  <SimpleShowLayout {...sectionStackProps}>
    <TextField source="Mobile" emptyText="-" />
    <TextField source="Email" emptyText="-" className={FULL_ROW} />
    <TextField source="WhatsApp_No" label="WhatsApp" emptyText="-" />
    <TextField source="Title" emptyText="-" />
    <TextField source="Category" emptyText="-" />
    <TextField source="Idara" emptyText="-" />
    <TextField source="Organisation" emptyText="-" className={FULL_ROW} />
    <TextField
      source="Organisation_CSV"
      label="Organisation (CSV)"
      emptyText="-"
      className={FULL_ROW}
    />
    <TextField source="Vatan" emptyText="-" />
    <TextField source="Nationality" emptyText="-" />
    <TextField source="Jamaat" emptyText="-" />
    <TextField source="Jamiaat" emptyText="-" />
    <TextField source="Qualification" emptyText="-" />
    <TextField source="Languages" emptyText="-" className={FULL_ROW} />
    <TextField source="Hunars" emptyText="-" className={FULL_ROW} />
    <TextField source="Occupation" emptyText="-" className={FULL_ROW} />
    <TextField source="Sub_Occupation" label="Sub Occupation" emptyText="-" className={FULL_ROW} />
    <TextField
      source="Sub_Occupation2"
      label="Sub Occupation 2"
      emptyText="-"
      className={FULL_ROW}
    />
    <TextField source="Quran_Sanad" label="Quran Sanad" emptyText="-" />
  </SimpleShowLayout>
);

const ZiyaratSection = () => (
  <SimpleShowLayout {...sectionStackProps}>
    <TextField source="Qadambosi_Sharaf" label="Qadambosi Sharaf" emptyText="-" />
    <TextField source="Raudat_Tahera_Ziyarat" label="Raudat Tahera Ziyarat" emptyText="-" />
    <TextField source="Karbala_Ziyarat" label="Karbala Ziyarat" emptyText="-" />
    <TextField source="Ashara_Mubaraka" label="Ashara Mubaraka" emptyText="-" />
  </SimpleShowLayout>
);

const AddressSectorSection = () => (
  <SimpleShowLayout {...sectionStackProps}>
    <TextField source="Address" emptyText="-" className={FULL_ROW} />
    <TextField source="Building" emptyText="-" />
    <TextField source="Street" emptyText="-" />
    <TextField source="Area" emptyText="-" />
    <TextField source="State" emptyText="-" />
    <TextField source="City" emptyText="-" />
    <TextField source="Pincode" emptyText="-" />
    <TextField source="Sector" emptyText="-" />
    <TextField source="Sub_Sector" label="Sub Sector" emptyText="-" />
    <TextField source="Inactive_Status" label="Inactive Status" emptyText="-" />
    <TextField source="Sector_Incharge_ITSID" label="Sector Incharge ITS" emptyText="-" />
    <TextField source="Sector_Incharge_Name" label="Sector Incharge Name" emptyText="-" />
    <TextField
      source="Sector_Incharge_Female_ITSID"
      label="Sector Incharge (F) ITS"
      emptyText="-"
    />
    <TextField
      source="Sector_Incharge_Female_Name"
      label="Sector Incharge (F) Name"
      emptyText="-"
    />
    <TextField source="Sub_Sector_Incharge_ITSID" label="Sub-Sector Incharge ITS" emptyText="-" />
    <TextField source="Sub_Sector_Incharge_Name" label="Sub-Sector Incharge Name" emptyText="-" />
    <TextField
      source="Sub_Sector_Incharge_Female_ITSID"
      label="Sub-Sector Incharge (F) ITS"
      emptyText="-"
    />
    <TextField
      source="Sub_Sector_Incharge_Female_Name"
      label="Sub-Sector Incharge (F) Name"
      emptyText="-"
    />
  </SimpleShowLayout>
);

const HousingMetaSection = () => (
  <SimpleShowLayout {...sectionStackProps}>
    <TextField source="Housing" emptyText="-" />
    <TextField source="Type_of_House" label="Type of House" emptyText="-" />
    <TextField source="Data_Verifcation_Status" label="Data Verification Status" emptyText="-" />
    <TextField source="Data_Verification_Date" label="Data Verification Date" emptyText="-" />
    <TextField source="Photo_Verifcation_Status" label="Photo Verification Status" emptyText="-" />
    <TextField source="Photo_Verification_Date" label="Photo Verification Date" emptyText="-" />
    <TextField source="Last_Scanned_Event" label="Last Scanned Event" emptyText="-" />
    <TextField source="Last_Scanned_Place" label="Last Scanned Place" emptyText="-" />
    <DateField source="createdAt" label="Created" showTime emptyText="-" />
    <DateField source="updatedAt" label="Last Updated" showTime emptyText="-" />
  </SimpleShowLayout>
);

const tabbedLayoutSx = {
  "& .RaTabbedShowLayout-content": {
    maxWidth: "100%",
    overflow: "hidden",
    px: { xs: 0.5, sm: 1, md: 2 },
    py: { xs: 1, md: 1.5 },
  },
};

type ItsdataShowProps = ComponentProps<typeof Show>;

const ItsdataShow = (props: ItsdataShowProps) => {
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
            <Section title="Personal & family">
              <PersonalSection />
            </Section>
            <Section title="Contact & work">
              <ContactWorkSection />
            </Section>
            <Section title="Ziyarat">
              <ZiyaratSection />
            </Section>
            <Section title="Address & sector">
              <AddressSectorSection />
            </Section>
            <Section title="Housing & meta">
              <HousingMetaSection />
            </Section>
          </>
        ) : (
          <TabbedShowLayout sx={tabbedLayoutSx}>
            <TabbedShowLayout.Tab label="Personal & family">
              <PersonalSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Contact & work" path="contact">
              <ContactWorkSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Ziyarat" path="ziyarat">
              <ZiyaratSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Address & sector" path="address">
              <AddressSectorSection />
            </TabbedShowLayout.Tab>
            <TabbedShowLayout.Tab label="Housing & meta" path="meta">
              <HousingMetaSection />
            </TabbedShowLayout.Tab>
          </TabbedShowLayout>
        )}
      </Box>
    </Show>
  );
};

export default ItsdataShow;
