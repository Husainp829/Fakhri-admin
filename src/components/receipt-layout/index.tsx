import "./receipt.css";

import { type ReactNode } from "react";
import { useHardcopyBorders } from "@/theme/useHardcopyBorders";
import ReceiptHeader from "./ReceiptHeader";
import ReceiptFooter from "./ReceiptFooter";

export type ReceiptPrintProps = {
  children: ReactNode;
  title: ReactNode;
  subTitle: ReactNode;
};

const ReceiptPrint = ({ children, title, subTitle }: ReceiptPrintProps) => {
  const { solid5 } = useHardcopyBorders();
  return (
    <>
      <div className="main-div">
        <div style={{ border: solid5, boxSizing: "border-box" }}>
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
};

export default ReceiptPrint;
