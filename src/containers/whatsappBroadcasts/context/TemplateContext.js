import React, { createContext, useContext } from "react";
import { useWatch } from "react-hook-form";
import { useTemplate } from "../components/hooks";

// Template Context to share template data across components
const TemplateContext = createContext(null);

/**
 * Hook to access template data from context
 */
export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (context === null) {
    throw new Error(
      "useTemplateContext must be used within a TemplateProvider"
    );
  }
  return context;
};

/**
 * TemplateProvider component that fetches template and provides it via context
 */
export const TemplateProvider = ({ children }) => {
  // Watch templateName from form context
  const templateName = useWatch({ name: "templateName" });

  // Fetch template once at parent level
  const templateQuery = useTemplate(templateName);

  return (
    <TemplateContext.Provider value={templateQuery}>
      {children}
    </TemplateContext.Provider>
  );
};
