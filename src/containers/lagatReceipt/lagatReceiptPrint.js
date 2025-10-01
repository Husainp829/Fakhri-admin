import React from "react";
import { ToWords } from "to-words";
import dayjs from "dayjs";
import QRCode from "react-qr-code";
import { useParams } from "react-router";
import { useGetOne } from "react-admin";
import ReceiptHeader from "../../components/ReceiptLayout/receiptHeader";

const LagatReceiptPrint = () => {
  const { id } = useParams();
  const { data, error } = useGetOne("lagatReceipts", { id });

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
          <ReceiptHeader
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
          />

          <div className="u-row" style={{ margin: "0 auto" }}>
            <div style={{ display: "flex", width: "100%" }}>
              <div
                className="u-col u-col-100"
                style={{ boxSizing: "border-box", padding: "0", borderTop: "5px solid #ccc" }}
              >
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>Receipt No.</div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.receiptNo}
                    </div>
                    <div style={{ padding: "0 10px" }}>Date: </div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {dayjs(data.date).format("DD/MM/YYYY")}
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
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.itsNo}
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
                      {data?.paymentMode === "ONLINE"
                        ? `${data.paymentMode} Payment - (ref - ${data.paymentRef})`
                        : data.paymentMode}{" "}
                      towards Voluntary Contribution.
                    </div>
                  </div>
                </div>
                <div
                  style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between" }}
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
                    <span style={{ fontSize: 12 }}>VALID SUBJECT TO CLEARANCE</span>
                  </div>
                  <div
                    style={{
                      alignSelf: "center",
                      width: "180px",
                      textAlign: "center",
                    }}
                  >
                    <QRCode value={`${data.id}|${data.createdBy}`} size={100} />
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

export default LagatReceiptPrint;
