import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ToWords } from "to-words";

// Register font
import robotoBold from "../../assets/fonts/Roboto-Bold.ttf";
import robotoItalic from "../../assets/fonts/Roboto-Italic.ttf";
import roboto from "../../assets/fonts/Roboto-Regular.ttf";
import robotoThin from "../../assets/fonts/Roboto-Thin.ttf";
Font.register({
  family: "Roboto-Bold",
  src: robotoBold,
});
Font.register({
  family: "Roboto-Italic",
  src: robotoItalic,
});
Font.register({
  family: "Roboto-Regular",
  src: roboto,
});
Font.register({
  family: "Roboto-Thin",
  src: robotoThin,
});

const toWords = new ToWords();
// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    fontSize: 12,
  },
  logo: {
    paddingLeft: "10px",
    paddingBottom: "5px",
    width: 55,
  },
  passWrapper: {
    margin: "10 auto",
    border: "3px solid black",
    width: "50%",
  },
  passHead: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flexGrow: 1,
  },
  headTextCommon: {
    alignSelf: "center",
    fontFamily: "Roboto-Bold",
    fontSize: "12px",
  },
  headText: {
    fontSize: "14px",
    letterSpacing: "1px",
  },
});

const ReceiptsPDF = ({ receipt, HOFITS, HOFName, markaz = "", total }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View
        style={{
          margin: "20px",
          padding: "10px",
          border: "1px solid black",
          flexDirection: "column",
        }}
      >
        <Text
          style={{
            marginTop: "5px",
            fontFamily: "Roboto-Bold",
            fontSize: "12px",
            alignSelf: "center",
          }}
        >
          {`Anjuman-E-Fakhri ${markaz}`}
        </Text>
        <Text
          style={{
            marginTop: "15px",
            fontFamily: "Roboto-Bold",
            fontSize: "18px",
            alignSelf: "center",
            color: "#800000",
          }}
        >
          NIYAAZ TANZEEM1
        </Text>
        <Text
          style={{
            marginTop: "15px",
            fontFamily: "Roboto-Bold",
            fontSize: "12px",
            alignSelf: "center",
          }}
        >
          Hoob Receipt
        </Text>
        <Text
          style={{
            marginTop: "10px",
            fontFamily: "Roboto-Regular",
            fontSize: "12px",
            alignSelf: "flex-end",
          }}
        >
          {`${receipt.date}, RNo: ${receipt.receiptNo}`}
        </Text>
        <Text
          style={{
            marginTop: "10px",
            fontFamily: "Roboto-Bold",
            fontSize: "16px",
            alignSelf: "flex-start",
            color: "#000080",
          }}
        >
          {`ITS ID : ${HOFITS}`}
        </Text>
        <Text
          style={{
            marginTop: "10px",
            fontFamily: "Roboto-Bold",
            fontSize: "14px",
            alignSelf: "flex-start",
          }}
        >
          {`Name : ${HOFName}`}
        </Text>
        <Text
          style={{
            marginTop: "10px",
            fontFamily: "Roboto-Bold",
            fontSize: "13px",
            alignSelf: "flex-start",
          }}
        >
          {`Markaz : ${markaz} | Takhmeen Amount : ${total}`}
        </Text>
        <Text
          style={{
            marginTop: "20px",
            fontFamily: "Roboto-Regular",
            fontSize: "14px",
          }}
        >
          Received with Thanks your contribution of
          <Text style={{ fontFamily: "Roboto-Bold" }}>{` Rs. ${receipt.amount} (${toWords.convert(
            receipt.amount
          )} by ${receipt.mode})`}</Text>
          {" towards Niyaz Hoob."}
        </Text>
        <Text
          style={{
            marginTop: "15px",
            fontFamily: "Roboto-Regular",
            fontSize: "12px",
            alignSelf: "flex-start",
          }}
        >
          The purpose of this Hoob is to do Niyaz Jaman during Shere Ramadan 1444
        </Text>
        <Text
          style={{
            marginTop: "15px",
            marginBottom: "20px",
            fontFamily: "Roboto-Italic",
            fontSize: "8px",
            alignSelf: "flex-start",
            color: "#BEBEBE",
          }}
        >
          This is a computer generated receipt and does not require a signature
        </Text>
      </View>
    </Page>
  </Document>
);

export { ReceiptsPDF };
