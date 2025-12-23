import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useFormContext, useWatch } from "react-hook-form";

// Recipient Selection Context to centralize recipient selection state management
const RecipientSelectionContext = createContext(null);

/**
 * Hook to access recipient selection state and methods from context
 */
export const useRecipientSelection = () => {
  const context = useContext(RecipientSelectionContext);
  if (context === null) {
    throw new Error(
      "useRecipientSelection must be used within a RecipientSelectionProvider"
    );
  }
  return context;
};

/**
 * RecipientSelectionProvider component that manages recipient selection state
 * and syncs it with the form context.
 *
 * This context:
 * - Manages selectedPhonesFromFilter state
 * - Tracks filterPreviewed status
 * - Computes mergedSelectedPhones (memoized) - now just filter phones
 * - Computes recipientCount (memoized)
 * - Syncs to form values (selectedRecipientPhones, recipientsPreviewed)
 * - Provides cached recipient details for SummaryStep
 */
export const RecipientSelectionProvider = ({ children }) => {
  const { setValue, control } = useFormContext();

  // Internal state for filter-based selection
  // Store recipient objects with ITS_ID and phone for accurate display
  const [selectedRecipientsFromFilter, setSelectedRecipientsFromFilter] =
    useState([]);
  const [filterPreviewed, setFilterPreviewed] = useState(false);

  // Watch filter criteria to reset preview when filter changes (useWatch is more efficient)
  const filterCriteria = useWatch({ control, name: "filterCriteria" });

  // Create stable key from filter criteria to detect actual changes
  const filterCriteriaKey = useMemo(() => {
    if (!filterCriteria) return "";
    return JSON.stringify(filterCriteria);
  }, [filterCriteria]);

  // Track previous filter key to prevent unnecessary resets
  const prevFilterKeyRef = useRef("");

  // Reset preview status when filter criteria actually changes
  useEffect(() => {
    if (filterCriteriaKey && filterCriteriaKey !== prevFilterKeyRef.current) {
      prevFilterKeyRef.current = filterCriteriaKey;
      setFilterPreviewed(false);
    }
  }, [filterCriteriaKey]);

  // Clean selected recipients - handle both old format (phone strings) and new format (recipient objects)
  const cleanSelectedRecipients = useMemo(() => {
    if (
      !selectedRecipientsFromFilter ||
      !Array.isArray(selectedRecipientsFromFilter)
    ) {
      return [];
    }

    // Check if it's the new format (objects with ITS_ID and phone) or old format (phone strings)
    const isNewFormat =
      selectedRecipientsFromFilter.length > 0 &&
      typeof selectedRecipientsFromFilter[0] === "object" &&
      selectedRecipientsFromFilter[0] !== null &&
      "phone" in selectedRecipientsFromFilter[0];

    if (isNewFormat) {
      // New format: filter out invalid recipients
      return selectedRecipientsFromFilter.filter(
        (r) => r && r.phone && String(r.phone).trim().length > 0
      );
    }
    // Old format: convert phone strings to recipient objects (backward compatibility)
    return selectedRecipientsFromFilter
      .filter((p) => p && String(p).trim().length > 0)
      .map((phone) => ({
        phone: String(phone).trim(),
        ITS_ID: null,
        Full_Name: null,
      }));
  }, [selectedRecipientsFromFilter]);

  // Extract phone numbers for form sync (backward compatibility)
  const cleanSelectedPhones = useMemo(
    () => cleanSelectedRecipients.map((r) => r.phone),
    [cleanSelectedRecipients]
  );

  // Compute recipient count (memoized)
  const recipientCount = useMemo(
    () => cleanSelectedRecipients.length,
    [cleanSelectedRecipients]
  );

  // Helper function to create a stable key from phone array for comparison
  const getPhonesKey = useCallback((phones) => {
    if (!phones || phones.length === 0) return "";
    return [...phones].sort().join(",");
  }, []);

  // Track previous form value keys to prevent unnecessary setValue calls
  const prevFormPhonesKeyRef = useRef("");

  // Sync selected phones to form context
  useEffect(() => {
    const currentKey = getPhonesKey(cleanSelectedPhones);
    // Only update if value has actually changed (using key comparison)
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

  // Track previous preview status to prevent unnecessary setValue calls
  const prevPreviewStatusRef = useRef(filterPreviewed);

  // Sync preview status to form context
  useEffect(() => {
    if (prevPreviewStatusRef.current !== filterPreviewed) {
      prevPreviewStatusRef.current = filterPreviewed;
      setValue("recipientsPreviewed", filterPreviewed, { shouldDirty: false });
    }
  }, [filterPreviewed, setValue]);

  // Cached recipient details for SummaryStep
  // Use recipient data directly from RecipientsPreview instead of doing phone lookup
  const recipientDetails = useMemo(() => {
    if (cleanSelectedRecipients.length === 0) {
      return [];
    }

    // Use the exact recipients from RecipientsPreview
    // If ITS_ID is available, use it; otherwise we'll need to lookup by phone
    return cleanSelectedRecipients.map((recipient) => ({
      phone: recipient.phone,
      ITS_ID: recipient.ITS_ID || "-",
      Full_Name: recipient.Full_Name || "-",
      matched: !!recipient.ITS_ID, // Consider matched if we have ITS_ID from RecipientsPreview
    }));
  }, [cleanSelectedRecipients]);

  const isLoadingDetails = false; // No loading needed since we use data directly

  // Methods to update selection state
  // Accept both old format (phone strings) and new format (recipient objects)
  const updateSelectedPhones = useCallback((recipients) => {
    // Handle both formats for backward compatibility
    if (!recipients || recipients.length === 0) {
      setSelectedRecipientsFromFilter([]);
      return;
    }

    // Check if it's the new format (objects) or old format (strings)
    const isNewFormat =
      typeof recipients[0] === "object" &&
      recipients[0] !== null &&
      "phone" in recipients[0];

    if (isNewFormat) {
      // New format: store recipient objects directly
      setSelectedRecipientsFromFilter(recipients);
      return;
    }
    // Old format: convert phone strings to recipient objects
    setSelectedRecipientsFromFilter(
      recipients.map((phone) => ({
        phone: String(phone).trim(),
        ITS_ID: null,
        Full_Name: null,
      }))
    );
  }, []);

  const updatePreviewStatus = useCallback((previewed) => {
    setFilterPreviewed(previewed);
  }, []);

  // Context value - memoized to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      // State
      selectedPhonesFromFilter: cleanSelectedPhones, // Keep for backward compatibility
      filterPreviewed,
      mergedSelectedPhones: cleanSelectedPhones,
      recipientCount,
      recipientDetails,
      isLoadingDetails,
      // Methods
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
