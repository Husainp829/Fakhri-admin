/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { ToWords } from "to-words";
import { Box } from "@mui/material";
import ReceiptPrint from "../../../components/ReceiptLayout";
import { formatDate } from "../../../utils";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";

dayjs.extend(utc);

/**
 * Format period for monthly sabils (CHULA, MUTTAVATTEEN)
 * Returns formatted periodStart and periodEnd as "MMM-YYYY"
 */
const formatMonthlyPeriod = (periodStart, periodEnd) => {
  const formatMonthYear = (value) => (value ? dayjs.utc(value).format("MMM-YYYY") : null);
  return {
    periodStart: formatMonthYear(periodStart),
    periodEnd: formatMonthYear(periodEnd),
  };
};

/**
 * Format period for yearly sabils (ESTABLISHMENT, PROFESSIONAL)
 * If periodStart is April and periodEnd is March, show "April YYYY to March YYYY+N"
 * where N is the number of years spanned (can be 1 or more for multiple financial years)
 * Otherwise, format as "MMM-YYYY"
 */
const formatYearlyPeriod = (periodStart, periodEnd) => {
  if (!periodStart) {
    return {
      periodStart: null,
      periodEnd: null,
    };
  }

  const startDate = dayjs.utc(periodStart);
  const endDate = periodEnd ? dayjs.utc(periodEnd) : null;

  // If periodStart is April (month 3 in 0-indexed) and periodEnd is March (month 2 in 0-indexed)
  // show full financial year format spanning multiple years if needed
  if (startDate.month() === 3 && endDate && endDate.month() === 2) {
    // April is month 3 (0-indexed), March is month 2 (0-indexed)
    const startYear = startDate.year();
    const endYear = endDate.year();
    return {
      periodStart: `April ${startYear}`,
      periodEnd: `March ${endYear}`,
    };
  }

  // Otherwise, format normally
  const formatMonthYear = (value) => (value ? dayjs.utc(value).format("MMM-YYYY") : null);
  return {
    periodStart: formatMonthYear(periodStart),
    periodEnd: formatMonthYear(periodEnd),
  };
};

const SabilReceipt = ({ ...props }) => {
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
          location: "sabilReceipt",
          method: "GET",
          id: receiptId,
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
  const sabilData = data?.sabilData || {};
  const itsdata = sabilData.itsdata || {};
  const sabilType = sabilData?.sabilType;
  const isYearlySabil = sabilType === "ESTABLISHMENT" || sabilType === "PROFESSIONAL";
  const isEstablishment = sabilType === "ESTABLISHMENT";
  const displayName = isEstablishment ? sabilData?.firmName || sabilData?.name : sabilData?.name;
  const displayAddress = isEstablishment
    ? sabilData?.firmAddress || sabilData?.address
    : sabilData?.address;

  // Format period based on sabil type
  const period = isYearlySabil
    ? formatYearlyPeriod(receiptData.periodStart, receiptData.periodEnd)
    : formatMonthlyPeriod(receiptData.periodStart, receiptData.periodEnd);
  const { periodStart, periodEnd } = period;

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
              <div style={{ paddingLeft: "10px" }}>حفظ الله تعالى</div>
            </div>
          </div>
          <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>{displayAddress}</div>

          <div style={{ textAlign: "center", padding: "10px" }}>بعد السلام الجميل</div>
          <div style={{ padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: "3", paddingRight: "10px", borderBottom: "1px solid #cfcfcf" }}>
                {toWords.convert(receiptData.amount || 0)} Only
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
                <>
                  <div style={{ flex: "1.5", borderBottom: "1px solid #cfcfcf" }}>{periodEnd}</div>
                  <div style={{ flex: "1", textAlign: "center" }}>إلى</div>
                </>
              )}
              {periodStart && (
                <div
                  style={{ flex: isYearlySabil ? "3" : "1.5", borderBottom: "1px solid #cfcfcf" }}
                >
                  {periodStart}
                </div>
              )}
              <div style={{ flex: "1.2", paddingLeft: "10px", textAlign: "right" }}>من شهر</div>
            </div>
          </div>

          {receiptData.remarks && (
            <div
              style={{
                padding: "20px 10px",
                borderTop: "1px solid #ccc",
                display: "flex",
                alignItems: "baseline",
                textAlign: "left",
              }}
            >
              <span style={{ whiteSpace: "nowrap", marginRight: "8px" }}>Remarks:</span>
              <span style={{ flex: 1, borderBottom: "1px solid #cfcfcf", minWidth: 0 }}>
                {receiptData.remarks}
              </span>
            </div>
          )}
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
