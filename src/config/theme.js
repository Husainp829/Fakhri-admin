import { defaultTheme } from "react-admin";
import { deepmerge } from "@mui/utils";

const appTheme = deepmerge(defaultTheme, {
  palette: {
    mode: "light",
    primary: {
      main: "#0A1F32",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffffff",
      contrastText: "#0A1F32",
    },
    error: { main: "#f44336" },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: ["Quantico", "Roboto", "sans-serif"].join(","),
  },
  sidebar: {
    borderRight: "1px solid #000",
  },
  components: {
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          "&.RaMenuItemLink-active": {
            background: "#6bd0dc",
            color: "#ffffff",
            "& .RaMenuItemLink-icon": {
              color: "#ffffff",
            },
          },
          "& .RaMenuItemLink-icon": {
            color: "#0A1F32",
          },
        },
      },
    },
  },
});

export default appTheme;
