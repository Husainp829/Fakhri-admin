import * as React from "react";
import { Card, CardContent } from "@mui/material";
import {
  FilterList,
  FilterListItem,
  FilterListSection,
  FilterLiveForm,
  SearchInput,
  TextInput,
  SelectInput,
} from "react-admin";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import HomeIcon from "@mui/icons-material/Home";
import MosqueIcon from "@mui/icons-material/Mosque";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";

const PostFilterSidebar = () => (
  <Card sx={{ order: -1, mr: 2, mt: 6, width: "25%", height: "fit-content" }}>
    <CardContent>
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
            choices={[
              {
                id: "Zone01-LullaNgr-to-Kubera-to-JyotiChowk",
                name: "Zone01-LullaNgr-to-Kubera-to-JyotiChowk",
              },
              {
                id: "Zone02-KausarBag-BrExuberance-EishaLoreals",
                name: "Zone02-KausarBag-BrExuberance-EishaLoreals",
              },
              {
                id: "Zone03-KausarBaug-HillMist-to-KumarParijat",
                name: "Zone03-KausarBaug-HillMist-to-KumarParijat",
              },
              {
                id: "Zone04-Mayfair to Bakers Point Area",
                name: "Zone04-Mayfair to Bakers Point Area",
              },
              { id: "Zone05-Natasha Sunshree Area", name: "Zone05-Natasha Sunshree Area" },
              { id: "Zone06-AmbaVatica Area", name: "Zone06-AmbaVatica Area" },
              { id: "Zone07-Brahma Aangan Area", name: "Zone07-Brahma Aangan Area" },
              { id: "Zone08-BoradeLane-to-Hakimi Area", name: "Zone08-BoradeLane-to-Hakimi Area" },
              {
                id: "Zone09-Salunke Vihar- Dorabjee Envc to ABC",
                name: "Zone09-Salunke Vihar- Dorabjee Envc to ABC",
              },
              { id: "Zone10-Salunkhe Vihar Rd Area 1", name: "Zone10-Salunkhe Vihar Rd Area 1" },
              { id: "Zone11-Salunkhe Vihar Rd Area 2", name: "Zone11-Salunkhe Vihar Rd Area 2" },
              { id: "Zone12-NIBM-Cloud9-Raheja Area", name: "Zone12-NIBM-Cloud9-Raheja Area" },
              { id: "Zone13-Kedari-Wanowrie Area", name: "Zone13-Kedari-Wanowrie Area" },
              { id: "ZoneXX-Others", name: "ZoneXX-Others" },
            ]}
            helperText={false}
          />
        </FilterLiveForm>
      </FilterListSection>

      <FilterListSection label="Sub Sector" icon={<LocationOnIcon />}>
        <FilterLiveForm>
          <SelectInput
            source="Sub_Sector"
            choices={[
              { id: "BrHorizon-to-KrishnaKeval", name: "BrHorizon-to-KrishnaKeval" },
              { id: "JyotiArea", name: "JyotiArea" },
              { id: "LullaNgrArea", name: "LullaNgrArea" },
              { id: "Br Exuberance 1", name: "Br Exuberance 1" },
              { id: "Br Exuberance 2", name: "Br Exuberance 2" },
              { id: "Eisha Loreals", name: "Eisha Loreals" },
              { id: "Manish Park Area", name: "Manish Park Area" },
              { id: "Hil Mist Harmony", name: "Hil Mist Harmony" },
              { id: "Hill Mist Garden", name: "Hill Mist Garden" },
              { id: "Kool Homes Area", name: "Kool Homes Area" },
              { id: "Parijat-Pragati-Area", name: "Parijat-Pragati-Area" },
              { id: "Brahma Majestic 1", name: "Brahma Majestic 1" },
              { id: "Brahma Majestic 2", name: "Brahma Majestic 2" },
              { id: "Kubera Colony", name: "Kubera Colony" },
              { id: "Mayfair Area", name: "Mayfair Area" },
              { id: "Natasha Buildings", name: "Natasha Buildings" },
              { id: "Natasha Hill View", name: "Natasha Hill View" },
              { id: "Rest of Building - Rosary Lane", name: "Rest of Building - Rosary Lane" },
              { id: "Sunshree Buildings", name: "Sunshree Buildings" },
              { id: "Supreme Greenwoods", name: "Supreme Greenwoods" },
              { id: "Amba & Swarna Vatika", name: "Amba & Swarna Vatika" },
              { id: "Kubera Garden", name: "Kubera Garden" },
              { id: "Nivedita Gardens", name: "Nivedita Gardens" },
              {
                id: "Rest of Amba Vatika & Anandpuram Area",
                name: "Rest of Amba Vatika & Anandpuram Area",
              },
              { id: "Brahma Aangan A", name: "Brahma Aangan A" },
              { id: "Brahma Aangan B", name: "Brahma Aangan B" },
              { id: "Silver Estate & Parmar Residency", name: "Silver Estate & Parmar Residency" },
              { id: "Greenwood Society", name: "Greenwood Society" },
              { id: "Gulmohar Habitat", name: "Gulmohar Habitat" },
              { id: "Hakimi Area", name: "Hakimi Area" },
              { id: "Nancy & Kumar Gulmohar", name: "Nancy & Kumar Gulmohar" },
              { id: "Unity Splendour", name: "Unity Splendour" },
              { id: "Clover Village", name: "Clover Village" },
              { id: "Dorabjee Enclave", name: "Dorabjee Enclave" },
              { id: "Farm House to ABC Farm", name: "Farm House to ABC Farm" },
              { id: "Clover Citadel", name: "Clover Citadel" },
              { id: "Clover Heights", name: "Clover Heights" },
              { id: "Green Acres", name: "Green Acres" },
              { id: "Maestros", name: "Maestros" },
              { id: "Rest SV Road SS1", name: "Rest SV Road SS1" },
              { id: "Taha House SV", name: "Taha House SV" },
              { id: "Oxford Comfort", name: "Oxford Comfort" },
              { id: "Oxford Premium", name: "Oxford Premium" },
              { id: "Oxford Village", name: "Oxford Village" },
              { id: "Rest SV Road SS2", name: "Rest SV Road SS2" },
              {
                id: "Clover Highland Konark Indrayu Area",
                name: "Clover Highland Konark Indrayu Area",
              },
              { id: "Raheja Reserve", name: "Raheja Reserve" },
              { id: "Raheja Vista", name: "Raheja Vista" },
              { id: "Rest  of NIBM Bldg", name: "Rest  of NIBM Bldg" },
              { id: "Ganga Satellite & Utopia", name: "Ganga Satellite & Utopia" },
              { id: "Kedari Petrol Pump Area", name: "Kedari Petrol Pump Area" },
              { id: "Naren Hills & Windsor", name: "Naren Hills & Windsor" },
              { id: "Atraf-Murakib", name: "Atraf-Murakib" },
              { id: "Pending Cases", name: "Pending Cases" },
              { id: "Undri Pisoli Area", name: "Undri Pisoli Area" },
            ]}
            helperText={false}
          />
        </FilterLiveForm>
      </FilterListSection>

      <FilterListSection label="Idara" icon={<BusinessIcon />}>
        <FilterLiveForm>
          <SelectInput
            source="Idara"
            choices={[
              { id: "Ummal Kiram", name: "Ummal Kiram" },
              { id: "Al-Akabir", name: "Al-Akabir" },
              { id: "Maqami_Attalimiyah", name: "Maqami Attalimiyah" },
              { id: "Attalimiyah", name: "Attalimiyah" },
              { id: "Muntasebeen", name: "Muntasebeen" },
              { id: "Abnaul Jamea - Dirasat Khassa", name: "Abnaul Jamea - Dirasat Khassa" },
              { id: "Ima-e-Fatema", name: "Ima-e-Fatema" },
              { id: "Azwaaj_Attalimiyah", name: "Azwaaj Attalimiyah" },
              { id: "Abnaul Jamea - Surat", name: "Abnaul Jamea - Surat" },
              { id: "Abnaul Jamea - Marol", name: "Abnaul Jamea - Marol" },
              { id: "Azwaaj_Al-Akabir", name: "Azwaaj Al-Akabir" },
            ]}
            helperText={false}
          />
        </FilterLiveForm>
      </FilterListSection>

      <FilterListSection label="Organisation" icon={<BusinessIcon />}>
        <FilterLiveForm>
          <SelectInput
            source="Organisation"
            choices={[
              { id: "Saifee Womens Association", name: "Saifee Womens Association" },
              { id: "Shababil Eidz-Zahabi", name: "Shababil Eidz-Zahabi" },
              { id: "Nazafat / Environment Committee", name: "Nazafat / Environment Committee" },
              { id: "Tanzeem Committee", name: "Tanzeem Committee" },
              { id: "Zakereen", name: "Zakereen" },
              { id: "Burhani Womens Association", name: "Burhani Womens Association" },
              { id: "Dana Committee", name: "Dana Committee" },
              { id: "FMB", name: "FMB" },
              { id: "Burhani Guards International", name: "Burhani Guards International" },
              { id: "Wafd al-Huffaz Sanstha (WHS)", name: "Wafd al-Huffaz Sanstha (WHS)" },
              { id: "At Taalebaat ul Mumenaat", name: "At Taalebaat ul Mumenaat" },
              { id: "Bunayyaat ul Eid iz Zahabi", name: "Bunayyaat ul Eid iz Zahabi" },
              { id: "Zakeraat", name: "Zakeraat" },
              { id: "Tolobatul Kulliyatil Mumineen", name: "Tolobatul Kulliyatil Mumineen" },
              { id: "Alaqeeq", name: "Alaqeeq" },
              { id: "Taiseer un Nikah Committee", name: "Taiseer un Nikah Committee" },
              { id: "Hizb al Saifiyah al Burhaniyah", name: "Hizb al Saifiyah al Burhaniyah" },
            ]}
            helperText={false}
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
        <FilterListItem label="Photo - Verified" value={{ Photo_Verifcation_Status: "Verfied" }} />
        <FilterListItem
          label="Photo - Not Verified"
          value={{ Photo_Verifcation_Status: "Not Verified" }}
        />
      </FilterList>
    </CardContent>
  </Card>
);

export default PostFilterSidebar;
