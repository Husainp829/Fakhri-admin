/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

import React, { useEffect } from "react";
// import { Helmet } from "react-helmet";
import QRCode from "react-qr-code";

const styles = {
  th: {},
};

const ReceiptPrint = () => (
  <>
    <div
      style={{
        height: "148mm",
        display: "flex",
        justifyContent: "center",
        width: "210mm",
        background: "#afafaf",
      }}
    >
      <table
        style={{
          width: "100%",
          border: "1px solid black",
        }}
      >
        <tr>
          <th style={styles.th} colSpan={2}>Header 1</th>
        </tr>
        <tr>
          <td>Row 1, Cell 1</td>
          <td>Row 1, Cell 2</td>
        </tr>
        <tr>
          <td>Row 2, Cell 1</td>
          <td>Row 2, Cell 2</td>
        </tr>
        <tr>
          <td>Row 3, Cell 1</td>
          <td>Row 3, Cell 2</td>
        </tr>
        <tr>
          <td>Row 4, Cell 1</td>
          <td>Row 4, Cell 2</td>
        </tr>
        <tr>
          <td>Row 5, Cell 1</td>
          <td>Row 5, Cell 2</td>
        </tr>
      </table>
    </div>
  </>
);

export default ReceiptPrint;
