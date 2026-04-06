import { useEffect, useState, useMemo, type ComponentProps } from "react";
import { TextInput, useDataProvider } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import debounce from "lodash.debounce";

type ManualITSInputProps = ComponentProps<typeof TextInput>;

export const ManualITSInput = (props: ManualITSInputProps) => {
  const { setValue } = useFormContext();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(false);
  useWatch({ name: "sabilType" });
  const itsNo = useWatch({ name: "itsNo" });

  const lookupItsData = useMemo(
    () =>
      debounce(async (itsNoValue: string) => {
        if (!itsNoValue || !itsNoValue.trim()) {
          return;
        }

        setLoading(true);
        try {
          const { data } = await dataProvider.getList("itsData", {
            filter: { ITS_ID: itsNoValue.trim() },
            pagination: { page: 1, perPage: 1 },
            sort: { field: "id", order: "ASC" },
          });

          if (data && data.length > 0) {
            const itsData = data[0] as { Full_Name?: string; Address?: string };
            setValue("name", itsData.Full_Name || "");
            setValue("address", itsData.Address || "");
          } else {
            setValue("name", "");
            setValue("address", "");
          }
        } catch (error) {
          console.error("Error looking up ITS data:", error);
        } finally {
          setLoading(false);
        }
      }, 500),
    [dataProvider, setValue]
  );

  useEffect(() => {
    if (itsNo) {
      lookupItsData(itsNo as string);
    }
    return () => {
      lookupItsData.cancel();
    };
  }, [itsNo, lookupItsData]);

  return <TextInput {...props} disabled={loading} />;
};
