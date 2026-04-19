import type { ReactElement, ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { TypographyProps } from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";

import background from "../assets/JameaAlAnwar.jpg";

function Copyright(props: TypographyProps): ReactElement {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      Copyright ©
      <Link color="inherit" href="/">
        Anjuman-e-Fakhri Poona
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}

export type AuthBrandedShellProps = {
  children: ReactNode;
  /** Space below the logo (e.g. `"100px"` on login). */
  logoMarginBottom?: string;
};

/**
 * Shared full-viewport auth layout: backdrop image + paper panel + logo + footer.
 */
export function AuthBrandedShell({
  children,
  logoMarginBottom = "48px",
}: AuthBrandedShellProps): ReactElement {
  return (
    <Grid
      container
      component="main"
      sx={{
        height: "100vh",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: { xs: `url(${background})`, md: "none" },
      }}
    >
      <CssBaseline />
      <Grid
        sx={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        size={{ xs: false, sm: false, md: 8 }}
      />
      <Grid
        component={Paper}
        elevation={6}
        sx={(theme) => ({
          bgcolor: {
            xs: alpha(theme.palette.background.paper, 0.88),
            md: theme.palette.background.paper,
          },
        })}
        size={{ xs: 12, sm: 12, md: 4 }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            height: "65vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box>
            <img
              src="/logo.png"
              alt="logo"
              style={{ maxWidth: "100px", marginBottom: logoMarginBottom }}
            />
          </Box>
          {children}
        </Box>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Grid>
    </Grid>
  );
}
