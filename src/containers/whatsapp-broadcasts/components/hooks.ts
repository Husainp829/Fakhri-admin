import { useMemo, useState, useCallback } from "react";
import { useGetOne, useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";
import type { RaRecord } from "react-admin";
import {
  validateTemplateParameters,
  getMissingParametersMessage,
  extractTemplateVariables,
  type BroadcastParameter,
  type FilterCriteriaShape,
} from "./utils";

export const useTemplate = (templateName: string | undefined) =>
  useGetOne("whatsappTemplates", {
    id: templateName || "",
  });

export type PreviewRecipientsParams = {
  filterCriteria: FilterCriteriaShape | undefined | null;
  limit?: number;
  offset?: number;
  enabled?: boolean;
};

export const usePreviewRecipients = ({
  filterCriteria,
  limit = 10000,
  offset = 0,
  enabled = false,
}: PreviewRecipientsParams) => {
  const dataProvider = useDataProvider();

  return useQuery({
    queryKey: ["whatsappBroadcasts", "previewRecipients", filterCriteria, limit, offset],
    queryFn: async () => {
      if (!filterCriteria || (!filterCriteria.rules?.length && !filterCriteria.groups?.length)) {
        throw new Error("Please add at least one filter condition");
      }
      return dataProvider.previewRecipients("whatsappBroadcasts", {
        filterCriteria,
        limit,
        offset,
      });
    },
    enabled: enabled && !!filterCriteria,
    staleTime: 30000,
  });
};

export type TemplateBodyRecord = RaRecord & { bodyText?: string };

export const useTemplateValidation = (
  templateName: string | undefined,
  template: TemplateBodyRecord | undefined,
  isLoadingTemplate: boolean,
  parameters: Record<string, BroadcastParameter> | undefined,
  csvColumnHeaders: string[] = []
) => {
  const expectedVariables = useMemo(() => {
    if (!template?.bodyText) return [];
    return extractTemplateVariables(template.bodyText);
  }, [template?.bodyText]);

  const parametersSerialized = useMemo(() => JSON.stringify(parameters || {}), [parameters]);

  const csvHeadersSerialized = useMemo(
    () => JSON.stringify(csvColumnHeaders || []),
    [csvColumnHeaders]
  );

  const validationResult = useMemo(() => {
    if (!templateName) {
      return {
        isValid: false,
        errorMessage: "Please select a template before proceeding.",
        expectedVariables: [] as number[],
        validationErrors: {} as Record<string, string>,
      };
    }

    if (isLoadingTemplate) {
      return {
        isValid: false,
        errorMessage: "Loading template...",
        expectedVariables: [] as number[],
        validationErrors: {} as Record<string, string>,
      };
    }

    const result = validateTemplateParameters(
      template?.bodyText || "",
      parameters,
      csvColumnHeaders || []
    );

    return {
      isValid: result.isValid,
      errorMessage: result.isValid ? null : getMissingParametersMessage(result.missingParams),
      expectedVariables,
      validationErrors: result.errors,
    };
  }, [
    templateName,
    isLoadingTemplate,
    template?.bodyText,
    parametersSerialized,
    csvHeadersSerialized,
    expectedVariables,
  ]);

  return validationResult;
};

export type LookupItsResult = {
  matched: RaRecord[];
  unmatched: string[];
  count: number;
};

export const useLookupIts = () => {
  const dataProvider = useDataProvider();
  const [data, setData] = useState<LookupItsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lookup = useCallback(
    async (itsIds: string[]) => {
      if (!itsIds || itsIds.length === 0) {
        setData({ matched: [], unmatched: [], count: 0 });
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const result = (await dataProvider.lookupIts("whatsappBroadcasts", {
          itsIds,
        })) as LookupItsResult;
        setData({
          matched: (result.matched as RaRecord[]) ?? [],
          unmatched: (result.unmatched as string[]) ?? [],
          count: result.count ?? 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [dataProvider]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isLoading, error, lookup, reset };
};
