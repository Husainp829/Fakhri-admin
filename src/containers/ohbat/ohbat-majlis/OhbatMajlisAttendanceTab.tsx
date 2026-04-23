import { useEffect, useMemo, useState } from "react";
import {
  Datagrid,
  FunctionField,
  Pagination,
  ReferenceManyField,
  TextField,
  useCreatePath,
  useDataProvider,
  useListContext,
  usePermissions,
} from "react-admin";
import type { RaRecord } from "react-admin";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import { formatDisplayDateTime } from "@/utils/date-format";
import { hasPermission } from "@/utils/permission-utils";

const normalizeIts = (s: unknown) => String(s ?? "").trim();

/** Batches `getMany('itsdata')` for the current page (same path as quick attendance / dataProvider ITS handling). */
function OhbatAttendanceDatagridWithNames() {
  const { data: rows = [] } = useListContext();
  const dataProvider = useDataProvider();
  const createPath = useCreatePath();
  const [nameByIts, setNameByIts] = useState<Record<string, string>>({});
  const [namesReady, setNamesReady] = useState(false);

  const idsKey = useMemo(() => {
    const u = [
      ...new Set(rows.map((r) => normalizeIts((r as RaRecord).attendeeIts)).filter(Boolean)),
    ];
    return [...u].sort().join("\u0001");
  }, [rows]);

  useEffect(() => {
    const ids = idsKey ? idsKey.split("\u0001") : [];
    if (ids.length === 0) {
      setNameByIts({});
      setNamesReady(true);
      return;
    }
    let cancelled = false;
    setNamesReady(false);
    dataProvider
      .getMany("itsdata", { ids })
      .then(({ data: itsRows }) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const row of itsRows ?? []) {
          const rec = row as RaRecord;
          const k = normalizeIts(rec.ITS_ID);
          if (k) map[k] = normalizeIts(rec.Full_Name) || "—";
        }
        setNameByIts(map);
        setNamesReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setNameByIts({});
          setNamesReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dataProvider, idsKey]);

  return (
    <>
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <TextField source="attendeeIts" label="ITS" />
        <FunctionField
          label="Name"
          render={(record) => {
            const k = normalizeIts((record as RaRecord).attendeeIts);
            if (!k) return "—";
            if (!namesReady) return "…";
            const name = nameByIts[k] ?? "—";
            if (name === "—") return "—";
            return (
              <Link to={createPath({ resource: "itsdata", id: k, type: "show" })}>{name}</Link>
            );
          }}
        />
        <FunctionField
          label="Recorded"
          sortBy="createdAt"
          render={(record: RaRecord) => formatDisplayDateTime(record?.createdAt, { empty: "—" })}
        />
      </Datagrid>
      <Pagination />
    </>
  );
}

export function OhbatMajlisAttendanceTab() {
  const { permissions } = usePermissions();

  if (!hasPermission(permissions, "ohbatMajlisAttendance.view")) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        You do not have permission to view attendance for this majlis.
      </Typography>
    );
  }

  return (
    <ReferenceManyField
      reference="ohbatMajlisAttendance"
      target="ohbatMajalisId"
      label={false}
      sort={{ field: "createdAt", order: "DESC" }}
      perPage={25}
    >
      <OhbatAttendanceDatagridWithNames />
    </ReferenceManyField>
  );
}
