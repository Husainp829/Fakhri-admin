import { useEffect, useState, type ReactNode } from "react";
import { ToWords } from "to-words/en-IN";
import { Box } from "@mui/material";
import ReceiptPrint from "@/components/receipt-layout";
import { useHardcopyBorders } from "@/theme/useHardcopyBorders";
import { formatDate } from "@/utils";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";

/** Query string from hash route `#/fmb-receipt?receiptId=…` (not `window.location.search`). */
function getReceiptIdFromLocation(): string | null {
  const hash = window.location.hash || "";
  const q = hash.indexOf("?");
  const queryString = q >= 0 ? hash.slice(q + 1) : window.location.search.replace(/^\?/, "");
  return new URLSearchParams(queryString).get("receiptId");
}

type FmbPrintRow = Record<string, unknown> & {
  fmbData?: Record<string, unknown> & { itsdata?: Record<string, unknown>; fileNo?: unknown };
  allocations?: {
    fmbTakhmeen?: Record<string, unknown>;
    fmbContribution?: Record<string, unknown>;
  }[];
};

function LabelValue({
  label,
  value,
  noBorder,
  borderBottom,
}: {
  label: string;
  value: ReactNode;
  noBorder?: boolean;
  borderBottom: string;
}) {
  return (
    <div style={{ borderBottom: noBorder ? undefined : borderBottom }}>
      <div style={{ textAlign: "right", padding: "10px", fontSize: "14px" }}>{label}</div>
      <div style={{ textAlign: "right", padding: "10px" }}>{value}</div>
    </div>
  );
}

const FmbReceipt = () => {
  const { solid1, solid1Soft, solid5 } = useHardcopyBorders();
  const receiptId = getReceiptIdFromLocation();
  const [data, setData] = useState<FmbPrintRow | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!receiptId) {
      setError(true);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await callApiWithoutAuth({
          location: "fmbReceipt",
          method: "GET",
          id: `print/${receiptId}`,
        });
        const body = response?.data as { rows?: FmbPrintRow[] } | undefined;
        if (body?.rows?.[0]) {
          setData(body.rows[0]);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };

    fetchData();
  }, [receiptId]);

  if (error) {
    return <Box p={3}>No Results Found</Box>;
  }

  if (!data) {
    return <Box p={3}>...Loading</Box>;
  }

  const receiptData = data;
  const fmbData = (receiptData.fmbData ?? {}) as FmbPrintRow["fmbData"];
  const itsdata = (fmbData?.itsdata ?? {}) as Record<string, unknown>;
  const allocations = Array.isArray(receiptData.allocations) ? receiptData.allocations : [];
  const firstAnnual = allocations.find((a) => a?.fmbTakhmeen);
  const firstContrib = allocations.find((a) => a?.fmbContribution);
  const fmbTakhmeen = (firstAnnual?.fmbTakhmeen ?? {}) as Record<string, unknown>;
  const fmbContribution = (firstContrib?.fmbContribution ?? {}) as Record<string, unknown>;
  const hijriStart = (fmbTakhmeen.hijriYearStart ?? fmbContribution.hijriYearStart ?? null) as
    | number
    | null;
  const hijriEnd = (fmbTakhmeen.hijriYearEnd ?? (hijriStart ? hijriStart + 1 : null)) as
    | number
    | null;
  const fmbPeriodLabel = hijriStart && hijriEnd ? `${hijriStart}-${hijriEnd}` : "—";

  const toWords = new ToWords();
  const amountNum = Number(receiptData.amount ?? 0);

  return (
    <ReceiptPrint title="FMB Receipt" subTitle="">
      <div style={{ display: "flex", width: "100%" }}>
        <div
          className="u-col u-col-82p27"
          style={{ boxSizing: "border-box", padding: "0", borderTop: solid5 }}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ paddingRight: "10px" }}>نام</div>
              <div style={{ flex: "3", borderBottom: solid1Soft }}>
                {String(itsdata.Full_Name ?? "")}
              </div>
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالى</div>
            </div>
          </div>
          <div style={{ padding: "10px", borderBottom: solid1 }}>
            {String(itsdata.Address ?? "")}, {String(itsdata.City ?? "")} -{" "}
            {String(itsdata.Pincode ?? "")}, {String(itsdata.State ?? "")}
          </div>
          <div style={{ textAlign: "center", padding: "10px" }}>بعد السلام الجميل</div>
          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "3", paddingRight: "10px", borderBottom: solid1Soft }}>
                {toWords.convert(amountNum)} Only
              </div>
              <div style={{ flex: "0.5", paddingRight: "10px", textAlign: "center" }}>انكه</div>
              <div style={{ flex: "1", borderBottom: solid1Soft }}>
                {String(receiptData.amount ?? "")}
              </div>
              <div style={{ flex: "2", paddingLeft: "10px", textAlign: "right" }}>
                اٰپ طرف سي روپية
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "10px" }}>
            <strong>فيض المواىٔد البره‍انية</strong>&ldquo; فند ما&rdquo;
          </div>

          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ paddingRight: "10px" }}>ما وصول تهيا چهے</div>
              <div style={{ borderBottom: solid1Soft }}>{fmbPeriodLabel}</div>
            </div>
          </div>
        </div>

        <div
          className="u-col u-col-17p73"
          style={{
            boxSizing: "border-box",
            borderTop: solid5,
            borderLeft: solid5,
          }}
        >
          <LabelValue
            borderBottom={solid1}
            label="تاريخ"
            value={formatDate(receiptData.createdAt as string)}
          />
          <LabelValue
            borderBottom={solid1}
            label="رسيد نمبر"
            value={String(receiptData.receiptNo ?? "")}
          />
          <LabelValue
            borderBottom={solid1}
            label="Thaali No."
            value={String(fmbData?.fileNo ?? "")}
          />
          <LabelValue
            borderBottom={solid1}
            label="HOF ITS"
            value={String(itsdata.ITS_ID ?? "")}
            noBorder
          />
        </div>
      </div>
    </ReceiptPrint>
  );
};

export default FmbReceipt;
