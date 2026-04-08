import "./receipt.css";

import { useHardcopyBorders } from "@/theme/useHardcopyBorders";

const ReceiptFooter = () => {
  const { solid5 } = useHardcopyBorders();
  return (
    <>
      <div
        className="u-col u-col-100"
        style={{
          padding: "5px 5px 5px",
          borderTop: solid5,
          boxSizing: "border-box",
        }}
      >
        <div>
          <span style={{ fontSize: "10px" }}>
            <li>Voluntary Contribution.</li>
            <li>This is a computer generated receipt and does not require a signature.</li>
          </span>
        </div>
      </div>
    </>
  );
};

export default ReceiptFooter;
