import "./receipt.css";

import React from "react";

const ReceiptFooter = () => (
  <>
    <div
      className="u-col u-col-100"
      style={{
        padding: "10px 10px 10px",
        borderTop: "5px solid #ccc",
        boxSizing: "border-box",
      }}
    >
      <div>
        <span style={{ fontSize: "16px" }}>
          <li>Voluntary Contribution.</li>
          <li>This is a computer generated receipt and does not require a signature.</li>
        </span>
      </div>
    </div>
  </>
);

export default ReceiptFooter;
