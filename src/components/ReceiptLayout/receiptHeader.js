import "./receipt.css";

import React from "react";

const ReceiptHeader = ({ title, subTitle }) => (
  <>
    <div className="u-row" style={{ margin: "0 auto", display: "flex" }}>
      <div className="u-col u-col-21p13">
        <img
          src="https://assets.unlayer.com/stock-templates/1699793316187-logo512.png"
          alt="Fakhri Logo"
          style={{ height: "auto", width: "100%", maxWidth: "110px" }}
          width="110"
        />
      </div>

      <div
        className="u-col u-col-78p87"
        style={{ textAlign: "left", wordWrap: "break-word", padding: "10px 0" }}
      >
        <h1 style={{ margin: "0", fontSize: "22px", lineHeight: "22px", fontWeight: "700" }}>
          {title}
        </h1>
        <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "400" }}></h2>
        <div>{subTitle}</div>
      </div>
    </div>
  </>
);

export default ReceiptHeader;
