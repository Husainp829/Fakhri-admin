import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";
import { ToWords } from "to-words";
import { MARKAZ_LIST } from "../../constants";

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

const getBgColorByMarkaz = (markaz) => {
  switch (markaz) {
    case "ZM":
      return "#C4D5A7";
    case "BH":
      return "#FEC7C1";
    case "JM":
      return "#D4AF37";
    default:
      return "#C4D5A7";
  }
};

const getTextColorByMarkaz = (markaz) => {
  switch (markaz) {
    case "ZM":
      return "#3c4136";
    case "BH":
      return "#610C04";
    case "JM":
      return "#390500";
    default:
      return "#3c4136";
  }
};

// Create Document Component
const Passes = ({ familyMembers = [], formNo, markaz }) => (
  <Document width="100%">
    <Page size="A4" style={styles.page}>
      {familyMembers.map((fm, i) => (
        <View key={fm.its} style={styles.passWrapper} break={i !== 0}>
          <View
            style={{
              ...styles.passHead,
              backgroundColor: getBgColorByMarkaz(markaz),
            }}
          >
            <Image src="/logo.png" style={styles.logo} />
            <View style={styles.headerTextWrapper}>
              <Text
                style={{
                  ...styles.headTextCommon,
                  ...styles.headText,
                  color: getTextColorByMarkaz(markaz),
                }}
              >
                Anjuman-E-Fakhri Pune
              </Text>
              <Text
                style={{
                  ...styles.headTextCommon,
                  color: getTextColorByMarkaz(markaz),
                }}
              >{`${MARKAZ_LIST.find((m) => m.value === markaz)?.displayVal} Shehrulla1444`}</Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "5px",
            }}
          >
            <Text
              style={{
                alignSelf: "flex-end",
                paddingRight: "15px",
                fontSize: "10px",
                fontFamily: "Roboto-Bold",
              }}
            >{`Card # : ${formNo}/${i + 1}`}</Text>
            <View
              style={{
                fontFamily: "Roboto-Bold",
                fontSize: "13px",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ width: "20%" }}>ITS ID</Text>
              <Text style={{ marginRight: "10px" }}>:</Text>
              <View
                style={{
                  width: "80%",
                  flexDirection: "row",
                }}
              >
                <Text style={{ border: "2px solid black", padding: "3px 5px" }}>{fm.its}</Text>
              </View>
            </View>
            <View
              style={{
                paddingTop: "3px",
                fontSize: "12px",
                flexDirection: "row",
                overflow: "hidden",
              }}
            >
              <Text style={{ width: "20%" }}>Name</Text>
              <Text style={{ marginRight: "10px" }}>:</Text>
              <Text style={{ width: "80%" }}>{fm.name}</Text>
            </View>
            <View
              style={{
                paddingTop: "3px",
                fontSize: "12px",
                flexDirection: "row",
              }}
            >
              <Text style={{ width: "20%" }}>Gender</Text>
              <Text style={{ marginRight: "10px" }}>:</Text>
              <Text style={{ width: "80%" }}>{fm.gender}</Text>
            </View>
            <View
              style={{
                paddingTop: "3px",
                fontSize: "12px",
                flexDirection: "row",
              }}
            >
              <Text style={{ width: "20%" }}>Age</Text>
              <Text style={{ marginRight: "10px" }}>:</Text>
              <Text style={{ width: "80%" }}>{fm.age}</Text>
            </View>
            <Text
              style={{
                marginTop: "15px",
                fontFamily: "Roboto-Italic",
                fontSize: "8px",
              }}
            >
              Note: Non-Transferable, Please carry this card everyday
            </Text>
          </View>
        </View>
      ))}
    </Page>
  </Document>
);

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
            fontSize: "12px",
            alignSelf: "center",
          }}
        >
          Hoob Receipt2
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

export { Passes, ReceiptsPDF };
