import "./receipt.css";

import { type ReactNode } from "react";
import ReceiptHeader from "./ReceiptHeader";
import ReceiptFooter from "./ReceiptFooter";

export type ReceiptPrintProps = {
  children: ReactNode;
  title: ReactNode;
  subTitle: ReactNode;
};

const ReceiptPrint = ({ children, title, subTitle }: ReceiptPrintProps) => (
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
