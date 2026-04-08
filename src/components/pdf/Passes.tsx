import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { MARKAZ_LIST } from "@/constants";
import { getReactPdfColors } from "@/theme/reactPdfColors";
import "./register-fonts";

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

const getBgColorByMarkaz = (markaz: string, c: ReturnType<typeof getReactPdfColors>): string => {
  switch (markaz) {
    case "ZM":
      return c.passZmBg;
    case "BH":
      return c.passBhBg;
    case "JM":
      return c.passJmBg;
    default:
      return c.passZmBg;
  }
};

const getTextColorByMarkaz = (markaz: string, c: ReturnType<typeof getReactPdfColors>): string => {
  switch (markaz) {
    case "ZM":
      return c.passZmFg;
    case "BH":
      return c.passBhFg;
    case "JM":
      return c.passJmFg;
    default:
      return c.passZmFg;
  }
};

export type PassFamilyMember = {
  its: string | number;
  name: string;
  gender: string;
  age: string | number;
  hasChair?: boolean;
};

export type PassesProps = {
  familyMembers?: PassFamilyMember[];
  formNo: string | number;
  markaz: string;
  namaazVenue: string;
  event: { slug: string };
};

export function Passes({ familyMembers = [], formNo, markaz, namaazVenue, event }: PassesProps) {
  const markazLabel = MARKAZ_LIST[markaz] ?? markaz;
  const pdfColors = getReactPdfColors();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {familyMembers.map((fm, i) => (
          <View key={String(fm.its)} style={styles.passWrapper} break={i !== 0}>
            <View
              style={{
                ...styles.passHead,
                backgroundColor: getBgColorByMarkaz(markaz, pdfColors),
              }}
            >
              <Image src="/logo.png" style={styles.logo} />
              <View style={styles.headerTextWrapper}>
                <Text
                  style={{
                    ...styles.headTextCommon,
                    ...styles.headText,
                    color: getTextColorByMarkaz(markaz, pdfColors),
                  }}
                >
                  Anjuman-E-Fakhri Pune
                </Text>
                <Text
                  style={{
                    ...styles.headTextCommon,
                    color: getTextColorByMarkaz(markaz, pdfColors),
                  }}
                >{`${markazLabel} ${event.slug}`}</Text>
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
              <View
                style={{
                  paddingTop: "3px",
                  fontSize: "12px",
                  flexDirection: "row",
                }}
              >
                <Text style={{ width: "20%" }}>Namaaz</Text>
                <Text style={{ marginRight: "10px" }}>:</Text>
                <Text style={{ width: "20%", marginRight: "10px" }}>{namaazVenue}</Text>
                <Text style={{ width: "20%" }}>Jaman</Text>
                <Text style={{ marginRight: "10px" }}>:</Text>
                <Text style={{ width: "20%", marginRight: "10px" }}>{markaz}</Text>
              </View>
              <View
                style={{
                  paddingTop: "15px",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Roboto-Italic",
                    fontSize: "8px",
                  }}
                >
                  Note: Non-Transferable, Please carry this card everyday
                </Text>

                {fm.hasChair ? <Image src="/chair.png" style={{ height: "50px" }} /> : null}
              </View>
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
