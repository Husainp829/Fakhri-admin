/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { TextInput, useDataProvider } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { debounce } from "lodash";

/**
 * Manual ITS Input component that allows manual entry of ITS No.
 * If the ITS No. exists in itsdata, it auto-populates name and address.
 * If it doesn't exist, user can manually enter name and address.
 */
export const ManualITSInput = (props) => {
  const { setValue, watch } = useFormContext();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const sabilType = useWatch({ name: "sabilType" });
  const itsNo = useWatch({ name: "itsNo" });

  // Debounced function to lookup ITS data
  const lookupItsData = React.useMemo(
    () =>
      debounce(async (itsNoValue) => {
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
            const itsData = data[0];
            // Auto-populate from itsdata if found
            setValue("name", itsData.Full_Name || "");
            setValue("address", itsData.Address || "");
          } else {
            setValue("name", "");
            setValue("address", "");
          }
        } catch (error) {
          console.error("Error looking up ITS data:", error);
          // Don't show error notification - allow manual entry
        } finally {
          setLoading(false);
        }
      }, 500),
    [dataProvider, setValue, sabilType, watch]
  );

  useEffect(() => {
    if (itsNo) {
      lookupItsData(itsNo);
    }
    return () => {
      lookupItsData.cancel();
    };
  }, [itsNo, lookupItsData]);

  return <TextInput {...props} disabled={loading} />;
};
