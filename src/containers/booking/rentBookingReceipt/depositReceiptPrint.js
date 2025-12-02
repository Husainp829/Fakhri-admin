import React, { useEffect, useState } from "react";
import { ToWords } from "to-words";
import QRCode from "react-qr-code";
import { useParams } from "react-router";
import dayjs from "dayjs";

import ReceiptHeader from "../../../components/ReceiptLayout/receiptHeader";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";

const DepositReceiptPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const fetchData = () => {
      callApiWithoutAuth({ location: "contRcpt", method: "GET", id })
        .then(({ data: { rows } }) => {
          setData(rows?.[0] || {});
        })
        .catch(() => {
          setError(true);
        });
    };
    fetchData();
  }, []);

  if (error) {
    return <div className="main-div">No Results Found</div>;
  }

  if (!data) {
    return <div className="main-div">...Loading</div>;
  }

  const toWords = new ToWords();

  return (
    <div className="main-div">
      <div style={{ boxSizing: "border-box", height: "100%" }}>
        <div className="u-row-container" style={{ padding: 0 }}>
          <ReceiptHeader
            title="FAKHRI MOHALLA JAMAAT"
            subTitle="Contribution Receipt"
          />

          <div className="u-row" style={{ margin: "0 auto" }}>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                className="u-col u-col-100"
                style={{
                  boxSizing: "border-box",
                  padding: "0",
                  borderTop: "5px solid #ccc",
                }}
              >
                <div style={{ padding: "10px 20px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ paddingRight: "10px" }}>Receipt No. :</div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {data?.receiptNo}
                    </div>
                    <div style={{ padding: "0 10px" }}>Date : </div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {dayjs(data.date).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ paddingRight: "10px" }}>Received From</div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {data.organiser}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ paddingRight: "10px" }}>ITS No. :</div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {data.organiserIts}
                    </div>
                    <div style={{ paddingRight: "10px" }}>Reference No. :</div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {data.booking?.bookingNo}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ paddingRight: "10px" }}>Purpose :</div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {data.booking?.purpose}
                    </div>
                    <div style={{ paddingRight: "10px" }}>Mohalla :</div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {data.booking?.mohalla}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div style={{ paddingRight: "10px" }}>
                      Contribution Amount ₹:{" "}
                    </div>
                    <div
                      style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}
                    >
                      {toWords.convert(data.amount || 0)} Only /-
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        padding: "10px 20px",
                        border: "1px solid #afafaf",
                        fontSize: "30px",
                      }}
                    >
                      ₹ {data.amount} /-
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: "center",
                      width: "180px",
                      textAlign: "center",
                    }}
                  >
                    <QRCode value={`${data.id}|${data.createdBy}`} size={100} />
                    <p style={{ fontSize: 14, marginTop: -5 }}>
                      Digitally Signed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositReceiptPrint;
