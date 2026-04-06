import { Font } from "@react-pdf/renderer";
import robotoBold from "@/assets/fonts/Roboto-Bold.ttf";
import robotoItalic from "@/assets/fonts/Roboto-Italic.ttf";
import roboto from "@/assets/fonts/Roboto-Regular.ttf";
import robotoThin from "@/assets/fonts/Roboto-Thin.ttf";

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
