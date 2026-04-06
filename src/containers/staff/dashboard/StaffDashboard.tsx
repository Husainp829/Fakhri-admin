import { Title } from "react-admin";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function StaffDashboard() {
  return (
    <Box sx={{ p: 2 }}>
      <Title title="Staff Management" />
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Staff Dashboard</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
