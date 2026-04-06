import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@mui/material";
import {
  FilterList,
  FilterListItem,
  FilterListSection,
  FilterLiveForm,
  SearchInput,
  TextInput,
  SelectInput,
  useNotify,
} from "react-admin";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import HomeIcon from "@mui/icons-material/Home";
import MosqueIcon from "@mui/icons-material/Mosque";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { getApiUrl } from "@/constants";
import httpClient from "@/dataprovider/http-client";

const toChoices = (arr: string[] | undefined) => (arr || []).map((s) => ({ id: s, name: s }));

type PostFilterSidebarProps = {
  inDrawer?: boolean;
};

const PostFilterSidebar = ({ inDrawer = false }: PostFilterSidebarProps) => {
  const notify = useNotify();
  const [filterOpts, setFilterOpts] = useState<{
    sectors: string[];
    subSectors: string[];
    idaras: string[];
    organisations: string[];
  }>({
    sectors: [],
    subSectors: [],
    idaras: [],
    organisations: [],
  });
  const [optsLoading, setOptsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setOptsLoading(true);
    httpClient(`${getApiUrl()}/itsdata/filter-options`)
      .then(({ json }) => {
        if (!cancelled && json && typeof json === "object") {
          const j = json as {
            sectors?: unknown;
            subSectors?: unknown;
            idaras?: unknown;
            organisations?: unknown;
          };
          setFilterOpts({
            sectors: Array.isArray(j.sectors) ? (j.sectors as string[]) : [],
            subSectors: Array.isArray(j.subSectors) ? (j.subSectors as string[]) : [],
            idaras: Array.isArray(j.idaras) ? (j.idaras as string[]) : [],
            organisations: Array.isArray(j.organisations) ? (j.organisations as string[]) : [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          notify("Could not load sector / idara / organisation options from itsdata", {
            type: "error",
          });
          setFilterOpts({
            sectors: [],
            subSectors: [],
            idaras: [],
            organisations: [],
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOptsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const sectorChoices = useMemo(() => toChoices(filterOpts.sectors), [filterOpts.sectors]);
  const subSectorChoices = useMemo(() => toChoices(filterOpts.subSectors), [filterOpts.subSectors]);
  const idaraChoices = useMemo(() => toChoices(filterOpts.idaras), [filterOpts.idaras]);
  const organisationChoices = useMemo(
    () => toChoices(filterOpts.organisations),
    [filterOpts.organisations]
  );

  const selectHelper = optsLoading
    ? "Loading options…"
    : "From distinct values in your itsdata (current tenant)";

  return (
    <Card
      sx={{
        order: inDrawer ? 0 : -1,
        mr: inDrawer ? 0 : { xs: 0, md: 2 },
        mt: inDrawer ? 0 : 6,
        width: inDrawer ? "100%" : { xs: "100%", md: "25%" },
        minWidth: inDrawer ? undefined : { md: 260 },
        maxWidth: inDrawer ? "100%" : { md: 360 },
        height: "fit-content",
      }}
    >
      <CardContent>
        {optsLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1, mb: 1 }}>
            <CircularProgress size={22} />
          </Box>
        )}

        <FilterListSection label="Search" icon={<SearchIcon />}>
          <FilterLiveForm>
            <SearchInput source="q" resettable helperText="Search by ITS_ID or Full Name" />
          </FilterLiveForm>
        </FilterListSection>

        <FilterList label="HOF/FM Type" icon={<PersonIcon />}>
          <FilterListItem label="HOF" value={{ HOF_FM_TYPE: "HOF" }} />
          <FilterListItem label="FM" value={{ HOF_FM_TYPE: "FM" }} />
        </FilterList>

        <FilterList label="First Prefix" icon={<PersonIcon />}>
          <FilterListItem label="Shaikh" value={{ First_Prefix: "Shaikh" }} />
          <FilterListItem label="Mulla" value={{ First_Prefix: "Mulla" }} />
        </FilterList>

        <FilterListSection label="Age" icon={<PersonIcon />}>
          <FilterLiveForm>
            <TextInput
              source="Age_eq"
              resettable
              helperText="Exact age"
              label="Age (Equal)"
              type="number"
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextInput
                source="Age_gte"
                resettable
                helperText="Minimum age"
                label="Age (Min)"
                type="number"
              />
              <TextInput
                source="Age_lte"
                resettable
                helperText="Maximum age"
                label="Age (Max)"
                type="number"
              />
            </Box>
          </FilterLiveForm>
        </FilterListSection>

        <FilterList label="Gender" icon={<PersonIcon />}>
          <FilterListItem label="Male" value={{ Gender: "MALE" }} />
          <FilterListItem label="Female" value={{ Gender: "FEMALE" }} />
        </FilterList>

        <FilterList label="Misaq" icon={<PersonIcon />}>
          <FilterListItem label="Done" value={{ Misaq: "Done" }} />
          <FilterListItem label="Not Done" value={{ Misaq: "Not Done" }} />
        </FilterList>

        <FilterList label="Marital Status" icon={<PersonIcon />}>
          <FilterListItem label="Married" value={{ Marital_Status: "Married" }} />
          <FilterListItem label="Widowed" value={{ Marital_Status: "Widowed" }} />
          <FilterListItem label="Single" value={{ Marital_Status: "Single" }} />
          <FilterListItem label="Divorced" value={{ Marital_Status: "Divorced" }} />
          <FilterListItem label="Engaged" value={{ Marital_Status: "Engaged" }} />
        </FilterList>

        <FilterListSection label="Blood Group" icon={<PersonIcon />}>
          <FilterLiveForm>
            <SelectInput
              source="Blood_Group"
              choices={[
                { id: "B +ve", name: "B +ve" },
                { id: "B -ve", name: "B -ve" },
                { id: "A +ve", name: "A +ve" },
                { id: "AB +ve", name: "AB +ve" },
                { id: "O +ve", name: "O +ve" },
                { id: "O -ve", name: "O -ve" },
                { id: "A -ve", name: "A -ve" },
                { id: "AB -ve", name: "AB -ve" },
              ]}
              helperText={false}
            />
          </FilterLiveForm>
        </FilterListSection>

        <FilterList label="Warakatul Tarkhis" icon={<PersonIcon />}>
          <FilterListItem label="Yellow" value={{ Warakatul_Tarkhis: "Yellow" }} />
          <FilterListItem label="Green" value={{ Warakatul_Tarkhis: "Green" }} />
          <FilterListItem label="Not Obtained" value={{ Warakatul_Tarkhis: "Not Obtained" }} />
          <FilterListItem label="Red" value={{ Warakatul_Tarkhis: "Red" }} />
        </FilterList>

        <FilterListSection label="Sector" icon={<LocationOnIcon />}>
          <FilterLiveForm>
            <SelectInput
              source="Sector"
              choices={sectorChoices}
              disabled={optsLoading}
              emptyText="—"
              helperText={selectHelper}
            />
          </FilterLiveForm>
        </FilterListSection>

        <FilterListSection label="Sub Sector" icon={<LocationOnIcon />}>
          <FilterLiveForm>
            <SelectInput
              source="Sub_Sector"
              choices={subSectorChoices}
              disabled={optsLoading}
              emptyText="—"
              helperText={selectHelper}
            />
          </FilterLiveForm>
        </FilterListSection>

        <FilterListSection label="Idara" icon={<BusinessIcon />}>
          <FilterLiveForm>
            <SelectInput
              source="Idara"
              choices={idaraChoices}
              disabled={optsLoading}
              emptyText="—"
              helperText={selectHelper}
            />
          </FilterLiveForm>
        </FilterListSection>

        <FilterListSection label="Organisation" icon={<BusinessIcon />}>
          <FilterLiveForm>
            <SelectInput
              source="Organisation"
              choices={organisationChoices}
              disabled={optsLoading}
              emptyText="—"
              helperText={selectHelper}
            />
          </FilterLiveForm>
        </FilterListSection>

        <FilterList label="Ziyarat" icon={<MosqueIcon />}>
          <FilterListItem label="Qadambosi Sharaf - Yes" value={{ Qadambosi_Sharaf: "Yes" }} />
          <FilterListItem label="Qadambosi Sharaf - No" value={{ Qadambosi_Sharaf: "No" }} />
          <FilterListItem label="Raudat Tahera - Yes" value={{ Raudat_Tahera_Ziyarat: "Yes" }} />
          <FilterListItem label="Raudat Tahera - No" value={{ Raudat_Tahera_Ziyarat: "No" }} />
          <FilterListItem label="Karbala - Yes" value={{ Karbala_Ziyarat: "Yes" }} />
          <FilterListItem label="Karbala - No" value={{ Karbala_Ziyarat: "No" }} />
        </FilterList>

        <FilterListSection label="Ashara Mubaraka" icon={<MosqueIcon />}>
          <FilterLiveForm>
            <TextInput source="Ashara_Mubaraka" resettable helperText={false} />
          </FilterLiveForm>
        </FilterListSection>

        <FilterList label="Housing" icon={<HomeIcon />}>
          <FilterListItem label="Ownership" value={{ Housing: "Ownership" }} />
          <FilterListItem label="Rent" value={{ Housing: "Rent" }} />
          <FilterListItem label="Mortgage" value={{ Housing: "Mortgage" }} />
        </FilterList>

        <FilterList label="Type of House" icon={<HomeIcon />}>
          <FilterListItem label="Flat" value={{ Type_of_House: "Flat" }} />
          <FilterListItem label="Row House" value={{ Type_of_House: "Row House" }} />
          <FilterListItem label="Chawl" value={{ Type_of_House: "Chawl" }} />
          <FilterListItem label="Bunglow" value={{ Type_of_House: "Bunglow" }} />
          <FilterListItem label="Hutment" value={{ Type_of_House: "Hutment" }} />
        </FilterList>

        <FilterList label="Verification Status" icon={<VerifiedUserIcon />}>
          <FilterListItem label="Data - Verified" value={{ Data_Verifcation_Status: "Verified" }} />
          <FilterListItem
            label="Data - Not Verified"
            value={{ Data_Verifcation_Status: "Not Verified" }}
          />
          <FilterListItem
            label="Photo - Verified"
            value={{ Photo_Verifcation_Status: "Verfied" }}
          />
          <FilterListItem
            label="Photo - Not Verified"
            value={{ Photo_Verifcation_Status: "Not Verified" }}
          />
        </FilterList>
      </CardContent>
    </Card>
  );
};

export default PostFilterSidebar;
