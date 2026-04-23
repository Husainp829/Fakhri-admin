import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { ToWords } from "to-words/en-IN";
import { useParams } from "react-router";
import CommonReceiptA5 from "@/components/common-receipt/CommonReceiptA5";
import { APP_DISPLAY_DATE } from "@/utils/date-format";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";
import type { RaRecord } from "react-admin";

const YearlyNiyaazReceiptPrint = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RaRecord | null>(null);
  const [error, setError] = useState(false);

  const toWords = new ToWords();

  useEffect(() => {
    if (!id) return;
    callApiWithoutAuth({ location: "yearlyNiyaazReceipts", method: "GET", id })
      .then((res) => {
        const body = res.data as { rows?: RaRecord[] };
        const row = body.rows?.[0];
        setData(row ?? null);
      })
      .catch(() => {
        setError(true);
      });
  }, [id]);

  if (error) {
    return <Box p={3}>No Results Found</Box>;
  }

  if (!data) {
    return <Box p={3}>...Loading</Box>;
  }

  const niyaaz = data.yearlyNiyaaz as
    | { formNo?: string; name?: string; itsNo?: string; hijriYear?: string }
    | undefined;

  const paymentText =
    data.paymentMode === "ONLINE"
      ? `${data.paymentMode} - (ref - ${data.paymentRef || ""})`
      : String(data.paymentMode || "");

  const receiptLines = [
    {
      left: "Received from",
      right: `${niyaaz?.name || ""} ${niyaaz?.itsNo ? `(ITS - ${niyaaz.itsNo})` : ""}`,
      bold: true,
    },
    {
      left: "Form No / Hijri Year",
      right: `${niyaaz?.formNo || "-"} / ${niyaaz?.hijriYear || "-"}`,
    },
    {
      left: "The sum of Rupees",
      right: `${toWords.convert(Number(data.amount) || 0)} Only`,
      bold: true,
    },
    {
      left: "Received by / Towards",
      right: `${paymentText} towards Yearly Niyaaz`,
    },
    ...(data.remarks ? [{ left: "Remarks", right: String(data.remarks) }] : []),
  ];

  return (
    <CommonReceiptA5
      title="DAWOODI BOHRA JAMAAT TRUST"
      subTitle="Yearly Niyaaz Receipt"
      receiptNo={data?.receiptNo as string | undefined}
      date={data.receiptDate as string}
      dateFormat={APP_DISPLAY_DATE}
      receiptLines={receiptLines}
      amount={Number(data.amount)}
      currency="₹"
      digitalSignatureValue={`${data.id}|${data.createdBy}`}
      qrCodeSize={100}
      digitalSignatureText="Digitally Signed"
      footerNote="VALID SUBJECT TO CLEARANCE. This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
    />
  );
};

export default YearlyNiyaazReceiptPrint;
