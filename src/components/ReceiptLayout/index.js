import "./receipt.css";

import React from "react";
import ReceiptHeader from "./receiptHeader";
import ReceiptFooter from "./receiptFooter";

const ReceiptPrint = ({ children, title, subTitle }) => (
  <>
    <div className="main-div">
      <div style={{ border: "5px solid #ccc", boxSizing: "border-box" }}>
        <div className="u-row-container" style={{ padding: 0 }}>
          <ReceiptHeader title={title} subTitle={subTitle} />

          <div className="u-row" style={{ margin: "0 auto" }}>
            {children}
          </div>
          <ReceiptFooter />
        </div>
      </div>
    </div>
  </>
);

export default ReceiptPrint;
