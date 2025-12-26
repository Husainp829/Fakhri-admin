import React from "react";
import { useInput } from "react-admin";
import { useFormContext } from "react-hook-form";
import { useRecipientSelection } from "../context";
import RecipientFilters from "./RecipientFilters";

/**
 * RecipientSelectionStep Component
 *
 * Wraps RecipientFilters component for use in a Material-UI Stepper.
 * Integrates with React Admin form using useInput hook.
 * Tracks preview status and recipient count for step validation.
 *
 * @param {Object} props - Component props
 * @param {string} props.source - Form field source (default: '_recipientStep')
 * @param {Function} props.onValidationChange - Callback when validation state changes
 */
const RecipientSelectionStep = ({
  source = "_recipientStep",
  onValidationChange,
  ...props
}) => {
  // Use useInput to integrate with React Admin form
  const { field } = useInput({ source, ...props });
  const { setValue } = useFormContext();

  // Get recipient selection state from context (instead of watching form values)
  const { filterPreviewed, recipientCount } = useRecipientSelection();

  // Store count in form context for validation
  React.useEffect(() => {
    setValue("_recipientCount", recipientCount);
    // Store step completion status in the field
    field.onChange({
      previewed: filterPreviewed,
      count: recipientCount,
      isValid: filterPreviewed && recipientCount > 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPreviewed, recipientCount, setValue]);

  // Calculate validation state and error message
  const validationState = React.useMemo(() => {
    const isValid = filterPreviewed && recipientCount > 0;
    let errorMessage = null;

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

  // Expose validation state to parent stepper
  // Use ref to avoid including callback in dependencies (it may be recreated)
  const onValidationChangeRef = React.useRef(onValidationChange);
  const prevValidationStateRef = React.useRef(null);

  React.useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  React.useEffect(() => {
    // Only call callback if validation state actually changed
    // Check if this is the first render or if values actually changed
    const isFirstRender = prevValidationStateRef.current === null;
    const isValidChanged =
      prevValidationStateRef.current?.isValid !== validationState.isValid;
    const errorMessageChanged =
      prevValidationStateRef.current?.errorMessage !==
      validationState.errorMessage;

    if (
      onValidationChangeRef.current &&
      (isFirstRender || isValidChanged || errorMessageChanged)
    ) {
      onValidationChangeRef.current(
        validationState.isValid,
        validationState.errorMessage
      );
      prevValidationStateRef.current = validationState;
    }
  }, [validationState]);

  return <RecipientFilters />;
};

export default RecipientSelectionStep;
