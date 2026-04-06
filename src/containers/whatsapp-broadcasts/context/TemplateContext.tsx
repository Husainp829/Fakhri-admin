import { createContext, useContext, type ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { useTemplate } from "@/containers/whatsapp-broadcasts/components/hooks";

type TemplateQuery = ReturnType<typeof useTemplate>;

const TemplateContext = createContext<TemplateQuery | null>(null);

export const useTemplateContext = (): TemplateQuery => {
  const context = useContext(TemplateContext);
  if (context === null) {
    throw new Error("useTemplateContext must be used within a TemplateProvider");
  }
  return context;
};

type TemplateProviderProps = { children: ReactNode };

export const TemplateProvider = ({ children }: TemplateProviderProps) => {
  const templateName = useWatch({ name: "templateName" });
  const templateQuery = useTemplate(templateName);

  return <TemplateContext.Provider value={templateQuery}>{children}</TemplateContext.Provider>;
};
