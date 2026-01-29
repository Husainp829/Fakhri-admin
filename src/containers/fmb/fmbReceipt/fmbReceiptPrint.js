/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { ToWords } from "to-words";
import { Box } from "@mui/material";
import ReceiptPrint from "../../../components/ReceiptLayout";
import { formatDate } from "../../../utils";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";

const FmbReceipt = () => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const receiptId = searchParams.get("receiptId");
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
          id: receiptId,
        });
        if (response?.data) {
          setData(response.data);
        } else if (response?.data?.rows?.[0]) {
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
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالا</div>
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
            <strong>فيض المواىٔد البره‍انية</strong>&rdquo; فند ما&ldquo;
          </div>

          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "4", paddingRight: "10px" }}>سنة عيسوي وصول تهيا چهے</div>
              <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}></div>
              <div style={{ flex: "1", paddingRight: "10px", textAlign: "center" }}>سنة الا</div>
              <div style={{ flex: "2", borderBottom: "1px solid #cfcfcf" }}>
                {formatDate(receiptData.createdAt)}
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
          <LabelValue label="تاريخ" value={formatDate(receiptData.createdAt)} />
          <LabelValue label="رسيد نمبر" value={receiptData.receiptNo} />
          <LabelValue label="Thaali No." value={fmbData.fmbNo} />
          <LabelValue label="HOF ITS" value={itsdata.ITS_ID} noBorder />
        </div>
      </div>
    </ReceiptPrint>
  );
};

export default FmbReceipt;
