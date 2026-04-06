import { Card, CardContent, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";

type DeliverySlice = {
  name?: string;
  value?: number;
  color?: string;
};

type DeliveryProfileChartProps = {
  data: DeliverySlice[];
};

export default function DeliveryProfileChart({ data }: DeliveryProfileChartProps) {
  const renderLabel = (props: PieLabelRenderProps) => {
    const { name, value, percent } = props;
    const pct = typeof percent === "number" ? (percent * 100).toFixed(0) : "0";
    return `${name ?? ""}: ${value ?? 0} (${pct}%)`;
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Delivery schedule (active FMB)
        </Typography>
        {!data?.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
            No active FMB records for this tenant.
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
