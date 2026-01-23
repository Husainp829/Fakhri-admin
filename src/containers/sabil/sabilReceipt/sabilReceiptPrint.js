/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from "react";
import dayjs from "dayjs";
import { ToWords } from "to-words";
import { useGetOne } from "react-admin";
import ReceiptPrint from "../../../components/ReceiptLayout";
import { formatDate } from "../../../utils";

const SabilReceipt = ({ ...props }) => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const receiptId = searchParams.get("receiptId");
  const { data } = useGetOne("sabilReceipt", { id: receiptId });

  if (!data) {
    return null;
  }
  const receiptData = data || {};
  const sabilData = data?.sabilData || {};
  const itsdata = sabilData.itsdata || {};
  const isEstablishment = sabilData?.sabilType === "ESTABLISHMENT";
  const displayName = isEstablishment ? sabilData?.firmName || sabilData?.name : sabilData?.name;
  const displayAddress = isEstablishment
    ? sabilData?.firmAddress || sabilData?.address
    : sabilData?.address;
  const formatMonthYear = (value) => (value ? dayjs(value).format("MMM-YYYY") : null);
  const periodStart = formatMonthYear(receiptData.periodStart);
  const periodEnd = formatMonthYear(receiptData.periodEnd);

  const toWords = new ToWords();

  const LabelValue = ({ label, value, noBorder }) => (
    <div style={{ borderBottom: !noBorder && "1px solid #ccc" }}>
      <div style={{ textAlign: "right", padding: "10px" }}>{label}</div>
      <div style={{ fontSize: "13px", textAlign: "right", padding: "10px" }}>{value}</div>
    </div>
  );

  return (
    <ReceiptPrint
      title={
        <>
          DAWOODI BOHRA JAMAAT TRUST
          <br />
          FAKHRI MOHALLA POONA
        </>
      }
      subTitle={
        <>
          Trust Reg No E/7038(P)
          <br />
          Managed By Anjuman-e-Fakhri
        </>
      }
    >
      <div style={{ display: "flex", width: "100%" }}>
        <div
          className="u-col u-col-82p27"
          style={{ boxSizing: "border-box", padding: "0", borderTop: "5px solid #ccc" }}
        >
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ paddingRight: "10px" }}>نام</div>
              <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>{displayName}</div>
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالا</div>
            </div>
          </div>
          <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>{displayAddress}</div>

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
            <strong>سبيل الخير والبركات</strong>&rdquo; فند ما&ldquo;
          </div>

          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "3", paddingRight: "10px" }}>سنة عيسوي وصول تهيا چهے</div>
              {periodEnd && (
                <div style={{ flex: "1.5", borderBottom: "1px solid #cfcfcf" }}>
                  {isEstablishment ? "" : periodEnd}
                </div>
              )}
              <div style={{ flex: "1", textAlign: "center" }}>
                إلى
              </div>
              {periodStart && (
                <div style={{ flex: "1.5", borderBottom: "1px solid #cfcfcf" }}>
                  {isEstablishment ? "" : periodStart}
                </div>
              )}
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
          <LabelValue label="تاريخ" value={formatDate(receiptData.receiptDate)} />
          <LabelValue label="رسيد نمبر" value={receiptData.receiptNo} />
          <LabelValue label="سبيل نمبر" value={sabilData.sabilNo} />
          <LabelValue label="HOF ITS" value={itsdata.ITS_ID} noBorder />
        </div>
      </div>
    </ReceiptPrint>
  );
};

export default SabilReceipt;
