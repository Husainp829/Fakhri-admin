import { useLayoutEffect, useState } from "react";
import {
  AutocompleteInput,
  Edit,
  EditButton,
  ReferenceInput,
  SaveButton,
  Show,
  SimpleForm,
  TabbedShowLayout,
  TabbedShowLayoutTabs,
  Toolbar,
  TopToolbar,
  useRecordContext,
  useRefresh,
  usePermissions,
  Button,
} from "react-admin";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { hasPermission } from "@/utils/permission-utils";
import { MakhsoosHostSectorTab } from "./MakhsoosHostSectorTab";
import { OhbatItsdataItsPickerInput } from "./OhbatItsdataItsPickerInput";
import { OhbatMajlisAttendanceTab } from "./OhbatMajlisAttendanceTab";
import { OhbatMajlisDetailsTab } from "./OhbatMajlisDetailsTab";
import {
  registerOhbatMajlisShowDialogOpeners,
  unregisterOhbatMajlisShowDialogOpeners,
} from "./OhbatMajlisShowDialogOpeners";

function PartialEditToolbar({ onCancel }: { onCancel: () => void }) {
  return (
    <Toolbar sx={{ bgcolor: "transparent", boxShadow: "none", gap: 1 }}>
      <SaveButton />
      <Button label="Cancel" sx={{ py: 1, px: 2 }} onClick={onCancel} />
    </Toolbar>
  );
}

function ChangeSadaratDialog({
  open,
  onClose,
  majlisId,
}: {
  open: boolean;
  onClose: () => void;
  majlisId: string | number;
}) {
  const refresh = useRefresh();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Change sadarat assignment</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Edit
          key={`sadarat-${majlisId}`}
          resource="ohbatMajalis"
          id={majlisId}
          mutationMode="pessimistic"
          redirect={false}
          actions={false}
          transform={(data: Record<string, unknown>) => ({
            sadaratId: data.sadaratId || null,
          })}
          mutationOptions={{
            onSuccess: () => {
              refresh();
              onClose();
            },
          }}
        >
          <SimpleForm toolbar={<PartialEditToolbar onCancel={onClose} />}>
            <ReferenceInput source="sadaratId" reference="sadarats" perPage={100} allowEmpty>
              <AutocompleteInput optionText="name" label="Sadarat" emptyText="— None —" fullWidth />
            </ReferenceInput>
          </SimpleForm>
        </Edit>
      </DialogContent>
    </Dialog>
  );
}

function ChangeKhidmatDialog({
  open,
  onClose,
  majlisId,
}: {
  open: boolean;
  onClose: () => void;
  majlisId: string | number;
}) {
  const refresh = useRefresh();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Change khidmatguzar</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Edit
          key={`khidmat-${majlisId}`}
          resource="ohbatMajalis"
          id={majlisId}
          mutationMode="pessimistic"
          redirect={false}
          actions={false}
          transform={(data: Record<string, unknown>) => ({
            khidmatguzarItsNo:
              typeof data.khidmatguzarItsNo === "string"
                ? data.khidmatguzarItsNo.trim() || null
                : null,
          })}
          mutationOptions={{
            onSuccess: () => {
              refresh();
              onClose();
            },
          }}
        >
          <SimpleForm toolbar={<PartialEditToolbar onCancel={onClose} />}>
            <ReferenceInput
              source="khidmatguzarItsNo"
              reference="itsdata"
              filter={{ forKhidmatguzarPicker: true }}
              allowEmpty
              perPage={50}
            >
              <AutocompleteInput
                optionText={(r) => `${r.ITS_ID} — ${r.Full_Name || ""}`}
                optionValue="ITS_ID"
                label="Khidmatguzar"
                filterToQuery={(q) => ({ q: q || "", forKhidmatguzarPicker: true })}
                emptyText="— None —"
                debounce={300}
                fullWidth
              />
            </ReferenceInput>
          </SimpleForm>
        </Edit>
      </DialogContent>
    </Dialog>
  );
}

function ChangeZakereenDialog({
  open,
  onClose,
  majlisId,
}: {
  open: boolean;
  onClose: () => void;
  majlisId: string | number;
}) {
  const refresh = useRefresh();
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Change zakereen</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Edit
          key={`zakereen-${majlisId}`}
          resource="ohbatMajalis"
          id={majlisId}
          mutationMode="pessimistic"
          redirect={false}
          actions={false}
          transform={(data: Record<string, unknown>) => ({
            zakereenItsNo:
              typeof data.zakereenItsNo === "string" ? data.zakereenItsNo.trim() || null : null,
          })}
          mutationOptions={{
            onSuccess: () => {
              refresh();
              onClose();
            },
          }}
        >
          <SimpleForm toolbar={<PartialEditToolbar onCancel={onClose} />}>
            <OhbatItsdataItsPickerInput source="zakereenItsNo" label="Zakereen" />
          </SimpleForm>
        </Edit>
      </DialogContent>
    </Dialog>
  );
}

function OhbatMajlisShowActions() {
  const record = useRecordContext();

  const { permissions } = usePermissions();
  const [sadaratOpen, setSadaratOpen] = useState(false);
  const [khidmatOpen, setKhidmatOpen] = useState(false);
  const [zakereenOpen, setZakereenOpen] = useState(false);

  const canEditMajlis = hasPermission(permissions, "ohbatMajalis.edit");

  const id = record?.id;

  useLayoutEffect(() => {
    registerOhbatMajlisShowDialogOpeners({
      openSadarat: () => setSadaratOpen(true),
      openKhidmat: () => setKhidmatOpen(true),
      openZakereen: () => setZakereenOpen(true),
    });
    return () => unregisterOhbatMajlisShowDialogOpeners();
  }, []);

  return (
    <>
      <TopToolbar>{canEditMajlis ? <EditButton /> : null}</TopToolbar>
      {id != null && (
        <>
          <ChangeSadaratDialog
            open={sadaratOpen}
            onClose={() => setSadaratOpen(false)}
            majlisId={id}
          />
          <ChangeKhidmatDialog
            open={khidmatOpen}
            onClose={() => setKhidmatOpen(false)}
            majlisId={id}
          />
          <ChangeZakereenDialog
            open={zakereenOpen}
            onClose={() => setZakereenOpen(false)}
            majlisId={id}
          />
        </>
      )}
    </>
  );
}

const OhbatMajlisShow = () => (
  <>
    <Show actions={<OhbatMajlisShowActions />}>
      <TabbedShowLayout
        tabs={
          <TabbedShowLayoutTabs
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: 0.3 },
            }}
          />
        }
      >
        <TabbedShowLayout.Tab label="Details">
          <OhbatMajlisDetailsTab />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Makhsoos (host sector / sub-sector)" path="makhsoos">
          <MakhsoosHostSectorTab />
        </TabbedShowLayout.Tab>
        <TabbedShowLayout.Tab label="Attendance" path="attendance">
          <OhbatMajlisAttendanceTab />
        </TabbedShowLayout.Tab>
      </TabbedShowLayout>
    </Show>
  </>
);

export default OhbatMajlisShow;
