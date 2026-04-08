import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import type { ChartDatum } from "./ChartsRow";

type SabilTypeChartProps = {
  data: ChartDatum[];
};

const SabilTypeChart = ({ data }: SabilTypeChartProps) => {
  const theme = useTheme();
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Sabil Type Distribution
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: { name?: string | number; value?: number; percent?: number }) => {
                const name = String(props.name ?? "");
                const value = Number(props.value ?? 0);
                const percent = Number(props.percent ?? 0);
                return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
              }}
              outerRadius={80}
              fill={theme.palette.primary.main}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SabilTypeChart;
