import { useEffect, useState, type ReactNode } from "react";
import { ToWords } from "to-words/en-IN";
import { Box } from "@mui/material";
import ReceiptPrintLayout from "@/components/receipt-layout";
import { formatDate } from "@/utils";
import { MARKAZ_LIST } from "@/constants";
import { callApiWithoutAuth } from "@/dataprovider/misc-apis";
import { getHijriYear } from "@/utils/hijri-date-utils";

type NiyaazReceiptRow = {
  HOFName?: string;
  amount?: number;
  mode?: string;
  formNo?: string;
  receiptNo?: string;
  HOFId?: string;
  markaz?: string;
  createdAt?: string;
};

function isReceiptListPayload(data: unknown): data is { rows?: NiyaazReceiptRow[] } {
  return typeof data === "object" && data !== null && "rows" in data;
}

const ReceiptPrint = () => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const receiptId = searchParams.get("receiptId");
  const [data, setData] = useState<NiyaazReceiptRow | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!receiptId) {
      setError(true);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await callApiWithoutAuth({
          location: "receipts",
          method: "GET",
          id: receiptId,
        });
        const body = response?.data;
        if (isReceiptListPayload(body) && body.rows?.[0]) {
          setData(body.rows[0]);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    };

    void fetchData();
  }, [receiptId]);

  if (error) {
    return <Box p={3}>No Results Found</Box>;
  }

  if (!data) {
    return <Box p={3}>...Loading</Box>;
  }

  const receiptData = data;
  const toWords = new ToWords();

  const LabelValue = ({
    label,
    value,
    noBorder,
  }: {
    label: string;
    value: ReactNode;
    noBorder?: boolean;
  }) => (
    <div style={{ borderBottom: !noBorder ? "1px solid #ccc" : undefined }}>
      <div style={{ textAlign: "right", padding: "5px", fontSize: "13px" }}>{label}</div>
      <div style={{ fontSize: "15px", textAlign: "right", padding: "5px" }}>{value}</div>
    </div>
  );

  const markazLabel = data.markaz
    ? (MARKAZ_LIST[data.markaz as keyof typeof MARKAZ_LIST] ?? "")
    : "";

  return (
    <ReceiptPrintLayout
      title={`ANJUMAN-E-FAKHRI (${markazLabel.toUpperCase()})`}
      subTitle="NIYAAZ TANZEEM"
    >
      <div style={{ display: "flex", width: "100%" }}>
        <div
          className="u-col u-col-82p27"
          style={{ boxSizing: "border-box", padding: "0", borderTop: "5px solid #ccc" }}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ paddingRight: "10px" }}>نام</div>
              <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>{data?.HOFName}</div>
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالى</div>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "10px" }}>بعد السلام الجميل</div>
          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "3", paddingRight: "10px", borderBottom: "1px solid #cfcfcf" }}>
                {toWords.convert(Number(receiptData.amount ?? 0))} Only /-
              </div>
              <div style={{ flex: "0.5", paddingRight: "10px", textAlign: "center" }}>انكه</div>
              <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}>
                ₹ {Intl.NumberFormat("en-IN").format(receiptData.amount || 0)}
              </div>
              <div style={{ flex: "2", paddingLeft: "10px", textAlign: "right" }}>اٰپ طرف سي</div>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "10px" }}>
            ما &ldquo;<strong>Shehrullah-il-Moazzam {getHijriYear()}</strong>&rdquo;
          </div>

          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "4", paddingRight: "10px" }}>سنة عيسوي وصول تهيا چهے</div>
              <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}></div>
              <div style={{ flex: "2", borderBottom: "1px solid #cfcfcf" }}>
                {receiptData.createdAt ? formatDate(receiptData.createdAt) : ""}
              </div>
              <div style={{ flex: "1.2", paddingLeft: "10px", textAlign: "right" }}>من شهر</div>
            </div>
          </div>
        </div>

        <div
          className="u-col u-col-17p73"
          style={{
            boxSizing: "border-box",
            borderTop: "5px solid #ccc",
            borderLeft: "5px solid #ccc",
          }}
        >
          <LabelValue
            label="تاريخ"
            value={receiptData.createdAt ? formatDate(receiptData.createdAt) : ""}
          />
          <LabelValue label="Payment Mode" value={receiptData.mode} />
          <LabelValue label="Form No" value={receiptData.formNo} />
          <LabelValue label="رسيد نمبر" value={receiptData.receiptNo} />
          <LabelValue label="HOF ITS" value={receiptData.HOFId} noBorder />
        </div>
      </div>
    </ReceiptPrintLayout>
  );
};

export default ReceiptPrint;
