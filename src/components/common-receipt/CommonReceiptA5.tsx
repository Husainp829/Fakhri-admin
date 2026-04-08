import { Box, Typography, Divider, Stack, Paper, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import QRCode from "react-qr-code";
import dayjs from "dayjs";

export type ReceiptLineItem = {
  left: string;
  right?: string;
  bold?: boolean;
  capitalize?: boolean;
};

type ReceiptLineProps = {
  left: string;
  right?: string;
  bold?: boolean;
  capitalize?: boolean;
};

const ReceiptLine = ({ left, right, bold = false, capitalize = false }: ReceiptLineProps) => {
  const theme = useTheme();
  const dottedLine = `1px dotted ${alpha(theme.palette.text.primary, 0.38)}`;
  return (
    <Box display="grid" gridTemplateColumns="280px 1fr" py={0.8}>
      <Typography fontSize={16} color="text.secondary">
        {left}
      </Typography>
      <Typography
        fontSize={16}
        fontWeight={bold ? 600 : 400}
        sx={{ borderBottom: dottedLine, textTransform: capitalize ? "capitalize" : "none" }}
      >
        {right || "-"}
      </Typography>
    </Box>
  );
};

export type CommonReceiptA5Props = {
  title?: string;
  subTitle?: string;
  logoUrl?: string;
  receiptNo?: string;
  date?: string | Date;
  dateFormat?: string;
  receiptLines?: ReceiptLineItem[];
  amount?: number;
  currency?: string;
  digitalSignatureValue?: string;
  qrCodeSize?: number;
  digitalSignatureText?: string;
  footerNote?: string;
  showReceiptBadge?: boolean;
  receiptHeaderText?: string;
};

const CommonReceiptA5 = ({
  title,
  subTitle,
  logoUrl = "/logo512.png",
  receiptNo,
  date,
  dateFormat = "DD/MM/YYYY",
  receiptLines = [],
  amount,
  currency = "₹",
  digitalSignatureValue,
  qrCodeSize = 90,
  digitalSignatureText = "Digitally Verified",
  footerNote = "This receipt is computer generated and does not require a physical signature.",
  showReceiptBadge = true,
  receiptHeaderText = "RECEIPT",
}: CommonReceiptA5Props) => {
  const theme = useTheme();
  const formattedDate = date ? dayjs(date).format(dateFormat) : date || "-";
  const frameBorder = `1px solid ${theme.palette.text.primary}`;
  const totalBandBg = alpha(theme.palette.text.primary, 0.06);
  const totalAccent = `5px solid ${theme.palette.text.primary}`;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "210mm",
        height: "148mm",
        p: "5mm",
        boxSizing: "border-box",
        background: "transparent",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box>
          <img src={logoUrl} alt="Logo" width={90} />
        </Box>

        <Box flex={1}>
          <Typography fontSize={22} fontWeight={700}>
            {title || ""}
          </Typography>
          {subTitle && <Typography fontSize={14}>{subTitle}</Typography>}
        </Box>

        {showReceiptBadge && (
          <Box px={2} py={1} sx={{ border: frameBorder, fontSize: 14, letterSpacing: 2 }}>
            {receiptHeaderText || "RECEIPT"}
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 0.5, borderBottomWidth: 2 }} />

      <Stack direction="row" justifyContent="space-between" mb={2}>
        {receiptNo && (
          <Typography fontSize={16}>
            <strong>Receipt No:</strong> {receiptNo}
          </Typography>
        )}
        {formattedDate && (
          <Typography fontSize={16}>
            <strong>Date:</strong> {formattedDate}
          </Typography>
        )}
      </Stack>

      <Box>
        {receiptLines.map((line, index) => (
          <ReceiptLine
            key={index}
            left={line.left}
            right={line.right}
            bold={line.bold}
            capitalize={line.capitalize}
          />
        ))}
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
        {amount !== undefined && amount !== null && (
          <Box px={3} py={2} sx={{ bgcolor: totalBandBg, borderLeft: totalAccent }}>
            <Typography fontSize={13}>Total Amount Received</Typography>
            <Typography fontSize={28} fontWeight={700}>
              {currency} {amount} /-
            </Typography>
          </Box>
        )}

        {digitalSignatureValue && (
          <Box textAlign="center">
            <QRCode value={digitalSignatureValue} size={qrCodeSize} />
            <Typography fontSize={12} mt={0.5}>
              {digitalSignatureText}
            </Typography>
          </Box>
        )}
      </Stack>

      {footerNote && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography fontSize={12} textAlign="center" color="text.secondary">
            {footerNote}
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default CommonReceiptA5;
