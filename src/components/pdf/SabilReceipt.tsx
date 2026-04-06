import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ToWords } from "to-words/en-IN";
import "./register-fonts";

const toWords = new ToWords();

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    fontSize: 12,
  },
});

export type SabilReceiptLine = {
  date: string;
  receiptNo: string | number;
  amount: number;
  mode: string;
};

export type ReceiptsPdfProps = {
  receipt: SabilReceiptLine;
  HOFITS: string | number;
  HOFName: string;
  markaz?: string;
  total: string | number;
};

export function ReceiptsPDF({ receipt, HOFITS, HOFName, markaz = "", total }: ReceiptsPdfProps) {
  return (
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
}
