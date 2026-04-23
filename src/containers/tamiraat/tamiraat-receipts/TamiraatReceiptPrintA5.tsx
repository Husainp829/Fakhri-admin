import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { ToWords } from "to-words/en-IN";
import { Box } from "@mui/material";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";
import CommonReceiptA5 from "@/components/common-receipt/CommonReceiptA5";
import { APP_DISPLAY_DATE } from "@/utils/date-format";

const TamiraatReceiptPrintA5 = () => {
  const { id } = useParams();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState(false);

  const toWords = new ToWords();

  useEffect(() => {
    callApiWithoutAuth({
      location: "tamiraatReceipts",
      method: "GET",
      id,
    })
      .then((res) => {
        const body = res.data as { rows?: Record<string, unknown>[] };
        setData(body.rows?.[0] ?? null);
      })
      .catch(() => setError(true));
  }, [id]);

  if (error) return <Box p={3}>No Results Found</Box>;
  if (!data) return <Box p={3}>Loading…</Box>;

  const paymentText: string =
    data.paymentMode === "ONLINE"
      ? `${String(data.paymentMode)} (Ref: ${String(data.paymentRef ?? "-")})`
      : String(data.paymentMode ?? "");

  const receiptLines = [
    {
      left: "Received from",
      right: `${String(data.name ?? "")}${data.itsNo ? ` (ITS - ${String(data.itsNo)})` : ""}`,
      bold: true,
    },
    {
      left: "The sum of Rupees",
      right: `${toWords.convert(Number(data.amount) || 0)} Only`,
      bold: true,
    },
    {
      left: "Received by",
      right: paymentText,
    },
    {
      left: "Towards",
      right: "Tamiraat Voluntary Contribution",
      bold: true,
    },
  ];

  if (data.purpose) {
    receiptLines.push({
      left: "For",
      right: String(data.purpose),
    });
  }

  return (
    <CommonReceiptA5
      title="DAWOODI BOHRA JAMAAT TRUST"
      subTitle="Trust Reg No E/7038(P)"
      logoUrl="/logo512.png"
      receiptNo={data.receiptNo != null ? String(data.receiptNo) : undefined}
      date={data.receiptDate as string | Date | undefined}
      dateFormat={APP_DISPLAY_DATE}
      receiptLines={receiptLines}
      amount={Number(data.amount)}
      currency="\u20B9"
      digitalSignatureValue={`${String(data.id)}|${String(data.updatedBy ?? "")}`}
      qrCodeSize={90}
      digitalSignatureText="Digitally Verified"
      footerNote="This receipt is computer generated and does not require a physical signature."
      showReceiptBadge
    />
  );
};

export default TamiraatReceiptPrintA5;
