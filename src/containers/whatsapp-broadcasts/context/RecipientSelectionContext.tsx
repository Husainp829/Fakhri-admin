import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { FilterCriteriaShape } from "@/containers/whatsapp-broadcasts/components/utils";

export type RecipientFromFilter = {
  phone: string;
  ITS_ID: string | null;
  Full_Name: string | null;
};

export type RecipientDetailRow = {
  phone: string;
  ITS_ID: string;
  Full_Name: string;
  matched: boolean;
};

type RecipientSelectionContextValue = {
  selectedPhonesFromFilter: string[];
  filterPreviewed: boolean;
  mergedSelectedPhones: string[];
  recipientCount: number;
  recipientDetails: RecipientDetailRow[];
  isLoadingDetails: boolean;
  updateSelectedPhones: (recipients: string[] | RecipientFromFilter[]) => void;
  updatePreviewStatus: (previewed: boolean) => void;
};

const RecipientSelectionContext = createContext<RecipientSelectionContextValue | null>(null);

export const useRecipientSelection = (): RecipientSelectionContextValue => {
  const context = useContext(RecipientSelectionContext);
  if (context === null) {
    throw new Error("useRecipientSelection must be used within a RecipientSelectionProvider");
  }
  return context;
};

type RecipientSelectionProviderProps = { children: ReactNode };

export const RecipientSelectionProvider = ({ children }: RecipientSelectionProviderProps) => {
  const { setValue, control } = useFormContext();

  const [selectedRecipientsFromFilter, setSelectedRecipientsFromFilter] = useState<
    (string | RecipientFromFilter)[]
  >([]);
  const [filterPreviewed, setFilterPreviewed] = useState(false);

  const filterCriteria = useWatch({ control, name: "filterCriteria" }) as
    | FilterCriteriaShape
    | undefined;

  const filterCriteriaKey = useMemo(() => {
    if (!filterCriteria) return "";
    return JSON.stringify(filterCriteria);
  }, [filterCriteria]);

  const prevFilterKeyRef = useRef("");

  useEffect(() => {
    if (filterCriteriaKey && filterCriteriaKey !== prevFilterKeyRef.current) {
      prevFilterKeyRef.current = filterCriteriaKey;
      setFilterPreviewed(false);
    }
  }, [filterCriteriaKey]);

  const cleanSelectedRecipients = useMemo((): RecipientFromFilter[] => {
    if (!selectedRecipientsFromFilter || !Array.isArray(selectedRecipientsFromFilter)) {
      return [];
    }

    const isNewFormat =
      selectedRecipientsFromFilter.length > 0 &&
      typeof selectedRecipientsFromFilter[0] === "object" &&
      selectedRecipientsFromFilter[0] !== null &&
      "phone" in (selectedRecipientsFromFilter[0] as object);

    if (isNewFormat) {
      return (selectedRecipientsFromFilter as RecipientFromFilter[]).filter(
        (r) => r && r.phone && String(r.phone).trim().length > 0
      );
    }
    return (selectedRecipientsFromFilter as string[])
      .filter((p) => p && String(p).trim().length > 0)
      .map((phone) => ({
        phone: String(phone).trim(),
        ITS_ID: null,
        Full_Name: null,
      }));
  }, [selectedRecipientsFromFilter]);

  const cleanSelectedPhones = useMemo(
    () => cleanSelectedRecipients.map((r) => r.phone),
    [cleanSelectedRecipients]
  );

  const recipientCount = useMemo(() => cleanSelectedRecipients.length, [cleanSelectedRecipients]);

  const getPhonesKey = useCallback((phones: string[]) => {
    if (!phones || phones.length === 0) return "";
    return [...phones].sort().join(",");
  }, []);

  const prevFormPhonesKeyRef = useRef("");

  useEffect(() => {
    const currentKey = getPhonesKey(cleanSelectedPhones);
    if (currentKey !== prevFormPhonesKeyRef.current) {
      prevFormPhonesKeyRef.current = currentKey;
      if (cleanSelectedPhones.length > 0) {
        setValue("selectedRecipientPhones", cleanSelectedPhones, {
          shouldDirty: false,
        });
      } else {
        setValue("selectedRecipientPhones", null, { shouldDirty: false });
      }
    }
  }, [cleanSelectedPhones, setValue, getPhonesKey]);

  const prevPreviewStatusRef = useRef(filterPreviewed);

  useEffect(() => {
    if (prevPreviewStatusRef.current !== filterPreviewed) {
      prevPreviewStatusRef.current = filterPreviewed;
      setValue("recipientsPreviewed", filterPreviewed, { shouldDirty: false });
    }
  }, [filterPreviewed, setValue]);

  const recipientDetails = useMemo((): RecipientDetailRow[] => {
    if (cleanSelectedRecipients.length === 0) {
      return [];
    }

    return cleanSelectedRecipients.map((recipient) => ({
      phone: recipient.phone,
      ITS_ID: recipient.ITS_ID || "-",
      Full_Name: recipient.Full_Name || "-",
      matched: !!recipient.ITS_ID,
    }));
  }, [cleanSelectedRecipients]);

  const isLoadingDetails = false;

  const updateSelectedPhones = useCallback((recipients: string[] | RecipientFromFilter[]) => {
    if (!recipients || recipients.length === 0) {
      setSelectedRecipientsFromFilter([]);
      return;
    }

    const isNewFormat =
      typeof recipients[0] === "object" && recipients[0] !== null && "phone" in recipients[0];

    if (isNewFormat) {
      setSelectedRecipientsFromFilter(recipients as RecipientFromFilter[]);
      return;
    }
    setSelectedRecipientsFromFilter(
      (recipients as string[]).map((phone) => ({
        phone: String(phone).trim(),
        ITS_ID: null,
        Full_Name: null,
      }))
    );
  }, []);

  const updatePreviewStatus = useCallback((previewed: boolean) => {
    setFilterPreviewed(previewed);
  }, []);

  const value = useMemo(
    (): RecipientSelectionContextValue => ({
      selectedPhonesFromFilter: cleanSelectedPhones,
      filterPreviewed,
      mergedSelectedPhones: cleanSelectedPhones,
      recipientCount,
      recipientDetails,
      isLoadingDetails,
      updateSelectedPhones,
      updatePreviewStatus,
    }),
    [
      cleanSelectedPhones,
      filterPreviewed,
      recipientCount,
      recipientDetails,
      isLoadingDetails,
      updateSelectedPhones,
      updatePreviewStatus,
    ]
  );

  return (
    <RecipientSelectionContext.Provider value={value}>
      {children}
    </RecipientSelectionContext.Provider>
  );
};
