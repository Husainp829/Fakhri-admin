/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { ToWords } from "to-words";
import { Box } from "@mui/material";
import ReceiptPrint from "../../../components/ReceiptLayout";
import { formatDate } from "@/utils";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";

/** Query string from hash route `#/fmb-receipt?receiptId=…` (not `window.location.search`). */
function getReceiptIdFromLocation() {
  const hash = window.location.hash || "";
  const q = hash.indexOf("?");
  const queryString = q >= 0 ? hash.slice(q + 1) : window.location.search.replace(/^\?/, "");
  return new URLSearchParams(queryString).get("receiptId");
}

const FmbReceipt = () => {
  const receiptId = getReceiptIdFromLocation();
  const [data, setData] = useState(null);
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
        if (response?.data?.rows?.[0]) {
          setData(response.data.rows[0]);
        } else {
          setError(true);
        }
      } catch (err) {
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
  const receiptData = data || {};
  const fmbData = data?.fmbData || {};
  const itsdata = fmbData.itsdata || {};
  const allocations = Array.isArray(receiptData.allocations) ? receiptData.allocations : [];
  const firstAnnual = allocations.find((a) => a?.fmbTakhmeen);
  const firstContrib = allocations.find((a) => a?.fmbContribution);
  const fmbTakhmeen = firstAnnual?.fmbTakhmeen || {};
  const fmbContribution = firstContrib?.fmbContribution || {};
  const hijriStart = fmbTakhmeen?.hijriYearStart ?? fmbContribution?.hijriYearStart ?? null;
  const hijriEnd = fmbTakhmeen?.hijriYearEnd ?? (hijriStart ? hijriStart + 1 : null);
  const fmbPeriodLabel = hijriStart && hijriEnd ? `${hijriStart}-${hijriEnd}` : "—";

  const toWords = new ToWords();

  const LabelValue = ({ label, value, noBorder }) => (
    <div style={{ borderBottom: !noBorder && "1px solid #ccc" }}>
      <div style={{ textAlign: "right", padding: "10px", fontSize: "14px" }}>{label}</div>
      <div style={{ textAlign: "right", padding: "10px" }}>{value}</div>
    </div>
  );

  return (
    <ReceiptPrint>
      <div style={{ display: "flex", width: "100%" }}>
        <div
          className="u-col u-col-82p27"
          style={{ boxSizing: "border-box", padding: "0", borderTop: "5px solid #ccc" }}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ paddingRight: "10px" }}>نام</div>
              <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                {itsdata?.Full_Name}
              </div>
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالى</div>
            </div>
          </div>
          <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
            {itsdata?.Address}, {itsdata.City} - {itsdata.Pincode}, {itsdata.State}
          </div>
          <div style={{ textAlign: "center", padding: "10px" }}>بعد السلام الجميل</div>
          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "3", paddingRight: "10px", borderBottom: "1px solid #cfcfcf" }}>
                {toWords.convert(receiptData.amount)} Only
              </div>
              <div style={{ flex: "0.5", paddingRight: "10px", textAlign: "center" }}>انكه</div>
              <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}>
                {receiptData.amount}
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
              <div style={{ borderBottom: "1px solid #cfcfcf" }}>{fmbPeriodLabel}</div>
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
          <LabelValue label="تاريخ" value={formatDate(receiptData.createdAt)} />
          <LabelValue label="رسيد نمبر" value={receiptData.receiptNo} />
          <LabelValue label="Thaali No." value={fmbData.fileNo} />
          <LabelValue label="HOF ITS" value={itsdata.ITS_ID} noBorder />
        </div>
      </div>
    </ReceiptPrint>
  );
};

export default FmbReceipt;
