import { useEffect, useMemo, useRef } from "react";
import { useInput } from "react-admin";
import { useFormContext } from "react-hook-form";
import { useRecipientSelection } from "@/containers/whatsapp-broadcasts/context";
import RecipientFilters from "./RecipientFilters";

type RecipientSelectionStepProps = {
  source?: string;
  onValidationChange?: (isValid: boolean, errorMessage: string | null) => void;
};

const RecipientSelectionStep = ({
  source = "_recipientStep",
  onValidationChange,
  ...props
}: RecipientSelectionStepProps) => {
  const { field } = useInput({ source, ...props });
  const { setValue } = useFormContext();

  const { filterPreviewed, recipientCount } = useRecipientSelection();

  useEffect(() => {
    setValue("_recipientCount", recipientCount);
    field.onChange({
      previewed: filterPreviewed,
      count: recipientCount,
      isValid: filterPreviewed && recipientCount > 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPreviewed, recipientCount, setValue]);

  const validationState = useMemo(() => {
    const isValid = filterPreviewed && recipientCount > 0;
    let errorMessage: string | null = null;

    if (!isValid) {
      if (!filterPreviewed) {
        errorMessage =
          "Please preview recipients before proceeding. Click 'Preview Recipients' for filter-based selection.";
      } else if (recipientCount === 0) {
        errorMessage =
          "No recipients selected. Please select at least one recipient before proceeding.";
      }
    }

    return { isValid, errorMessage };
  }, [filterPreviewed, recipientCount]);

  const onValidationChangeRef = useRef(onValidationChange);
  const prevValidationStateRef = useRef<typeof validationState | null>(null);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  useEffect(() => {
    const isFirstRender = prevValidationStateRef.current === null;
    const isValidChanged = prevValidationStateRef.current?.isValid !== validationState.isValid;
    const errorMessageChanged =
      prevValidationStateRef.current?.errorMessage !== validationState.errorMessage;

    if (onValidationChangeRef.current && (isFirstRender || isValidChanged || errorMessageChanged)) {
      onValidationChangeRef.current(validationState.isValid, validationState.errorMessage);
      prevValidationStateRef.current = validationState;
    }
  }, [validationState]);

  return <RecipientFilters />;
};

export default RecipientSelectionStep;
