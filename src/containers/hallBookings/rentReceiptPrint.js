/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ToWords } from "to-words";
import dayjs from "dayjs";

import ReceiptHeader from "../../components/ReceiptLayout/receiptHeader";
import { callApiWithoutAuth } from "../../dataprovider/miscApis";

const RentReceiptPrint = () => {
  const { href } = window.location;
  const params = href.split("?")[1];
  const searchParams = new URLSearchParams(params);
  const receiptId = searchParams.get("receiptId");
  const [data, setData] = useState({});
  const [error, setError] = useState();

  useEffect(() => {
    const fetchData = () => {
      callApiWithoutAuth(`contRcpt/${receiptId}`, {}, "GET")
        .then(({ data: { rows } }) => {
          console.log(rows);
          setData(rows?.[0] || {});
        })
        .catch(() => {
          setError(true);
        });
    };
    fetchData();
  }, []);

  if (!data) {
    return null;
  }

  if (error) {
    return <div className="main-div">No Results Found</div>;
  }
  const receiptData = data || {};
  const toWords = new ToWords();

  return (
    <div className="main-div">
      <div style={{ border: "5px solid #ccc", boxSizing: "border-box" }}>
        <div className="u-row-container" style={{ padding: 0 }}>
          <ReceiptHeader title="DAWOODI BOHRA JAMAAT TRUST" subTitle="Trust Reg No E/7038(P)" />

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
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.organiser}
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>ITS No.</div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {data?.organiserIts}
                    </div>
                    <div style={{ padding: "0 10px" }}>PAN No.</div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>-</div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>The sum of ₹: </div>
                    <div style={{ flex: "3", borderBottom: "1px solid #cfcfcf" }}>
                      {toWords.convert(receiptData.total || 0)} Only /-
                    </div>
                  </div>
                </div>
                <div style={{ padding: "10px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ paddingRight: "10px" }}>
                      by{" "}
                      {data?.mode === "ONLINE" ? `${data.mode} - (ref - ${data.ref})` : data.mode}{" "}
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
                      ₹ {data.total} /-
                    </div>
                    <span style={{ fontSize: 12 }}>VALID SUBJECT TO CLEARANCE</span>
                  </div>
                  <div
                    style={{
                      borderTop: "1px solid #afafaf",
                      alignSelf: "center",
                      width: "180px",
                      textAlign: "center",
                    }}
                  >
                    Received By
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

export default RentReceiptPrint;
