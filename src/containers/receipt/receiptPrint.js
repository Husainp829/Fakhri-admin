import React from "react";
import { ToWords } from "to-words";
import { useGetOne, useStore } from "react-admin";
import ReceiptPrint from "../../components/ReceiptLayout";
import { formatDate } from "../../utils";
import { MARKAZ_LIST } from "../../constants";

const Receipt = () => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const receiptId = searchParams.get("receiptId");
  const { data } = useGetOne("receipts", { id: receiptId });
  const [currentEvent] = useStore("currentEvent");

  if (!data) {
    return null;
  }
  const receiptData = data || {};
  const toWords = new ToWords();

  const LabelValue = ({ label, value, noBorder }) => (
    <div style={{ borderBottom: !noBorder && "1px solid #ccc" }}>
      <div style={{ textAlign: "right", padding: "5px", fontSize: "13px" }}>{label}</div>
      <div style={{ fontSize: "15px", textAlign: "right", padding: "5px" }}>{value}</div>
    </div>
  );

  return (
    <ReceiptPrint
      title={`ANJUMAN-E-FAKHRI (${(MARKAZ_LIST[data.markaz] || "").toUpperCase()})`}
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
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالا</div>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "10px" }}>بعد السلام الجميل</div>
          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "3", paddingRight: "10px", borderBottom: "1px solid #cfcfcf" }}>
                {toWords.convert(receiptData.amount)} Only /-
              </div>
              <div style={{ flex: "0.5", paddingRight: "10px", textAlign: "center" }}>انكه</div>
              <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}>
                ₹ {Intl.NumberFormat("en-IN").format(receiptData.amount || 0)}
              </div>
              <div style={{ flex: "2", paddingLeft: "10px", textAlign: "right" }}>اٰپ طرف سي</div>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "10px" }}>
            ما &ldquo;<strong>{currentEvent.name}</strong>&rdquo;
          </div>

          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "4", paddingRight: "10px" }}>سنة عيسوي وصول تهيا چهے</div>
              <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}></div>
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
          <LabelValue label="Payment Mode" value={receiptData.mode} />
          <LabelValue label="Form No" value={receiptData.formNo} />
          <LabelValue label="رسيد نمبر" value={receiptData.receiptNo} />
          <LabelValue label="HOF ITS" value={receiptData.HOFId} noBorder />
        </div>
      </div>
    </ReceiptPrint>
  );
};

export default Receipt;
