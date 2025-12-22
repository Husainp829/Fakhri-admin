/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ToWords } from "to-words";
import dayjs from "dayjs";
import QRCode from "react-qr-code";
import { useParams } from "react-router";
import ReceiptHeader from "../../../components/ReceiptLayout/receiptHeader";
import { callApiWithoutAuth } from "../../../dataprovider/miscApis";

const MiqaatNiyaazReceiptPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const fetchData = () => {
      callApiWithoutAuth({ location: "miqaatNiyaazReceipts", method: "GET", id })
        .then(({ data: { rows } }) => {
          console.log(rows);
          setData(rows?.[0] || {});
        })
        .catch(() => {
          setError(true);
        });
    };
    fetchData();
  }, [id]);

  if (error) {
    return <div className="main-div">No Results Found</div>;
  }

  if (!data) {
    return <div className="main-div">...Loading</div>;
  }

  const receiptData = data || {};
  const toWords = new ToWords();

  return (
    <div className="main-div">
      <div style={{ boxSizing: "border-box", height: "100%" }}>
        <div className="u-row-container" style={{ padding: 0 }}>
          <ReceiptHeader title="DAWOODI BOHRA JAMAAT TRUST" subTitle="Trust Reg No E/7038(P)" />

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
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>Receipt No.</div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.receiptNo}
                    </div>
                    <div style={{ padding: "0 10px" }}>Date: </div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.receiptDate ? dayjs(data.receiptDate).format("DD/MM/YYYY") : ""}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>Received From</div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>{data?.name}</div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>ITS No.</div>
                    <div style={{ flex: "1", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.itsNo}
                    </div>
                    <div style={{ padding: "0 10px" }}>For: </div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.purpose || "-"}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>The sum of ₹: </div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {toWords.convert(receiptData.amount || 0)} Only /-
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>
                      by{" "}
                      {(() => {
                        const paymentMode = data?.paymentMode;
                        if (paymentMode === "ONLINE" || paymentMode === "CHEQUE") {
                          return `${paymentMode} - (ref - ${data.paymentRef || ""})`;
                        }
                        return paymentMode || "";
                      })()}{" "}
                      towards Niyaaz Voluntary Contribution.
                    </div>
                  </div>
                </div>
                {data?.remarks && (
                  <div style={{ padding: "10px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ paddingRight: "10px" }}>Remarks:</div>
                      <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                        {data.remarks}
                      </div>
                    </div>
                  </div>
                )}
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
                    <QRCode value={`${data.id}|${data.updatedBy || ""}`} size={100} />
                    <p style={{ fontSize: 14, marginTop: -5 }}>Digitally Signed.</p>
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

export default MiqaatNiyaazReceiptPrint;
