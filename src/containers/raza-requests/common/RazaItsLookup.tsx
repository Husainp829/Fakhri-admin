import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { TextInput, useDataProvider } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import debounce from "lodash.debounce";

type RazaItsLookupProps = ComponentProps<typeof TextInput>;

export default function RazaItsLookup(props: RazaItsLookupProps) {
  const { setValue } = useFormContext();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const itsNo = useWatch({ name: "itsNo" });

  const lookupItsData = useMemo(
    () =>
      debounce(async (itsNoValue: string) => {
        const trimmed = itsNoValue.trim();
        if (!trimmed) {
          setValue("name", "");
          setValue("address", "");
          return;
        }
        setLoading(true);
        try {
          const { data } = await dataProvider.getList("itsdata", {
            pagination: { page: 1, perPage: 1 },
            sort: { field: "ITS_ID", order: "ASC" },
            filter: {
              q: trimmed,
              includeFamily: true,
            },
          });
          if (data.length > 0) {
            const row = data[0] as { ITS_ID?: string; Full_Name?: string; Address?: string };
            setValue("itsNo", row.ITS_ID ?? trimmed);
            setValue("name", row.Full_Name ?? "");
            setValue("address", row.Address ?? "");
          } else {
            setValue("name", "");
            setValue("address", "");
          }
        } catch (error) {
          console.error("Error looking up ITS data:", error);
        } finally {
          setLoading(false);
        }
      }, 400),
    [dataProvider, setValue]
  );

  useEffect(() => {
    if (typeof itsNo === "string") {
      lookupItsData(itsNo);
    }
    return () => {
      lookupItsData.cancel();
    };
  }, [itsNo, lookupItsData]);

  return <TextInput {...props} disabled={loading} />;
}
