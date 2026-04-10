import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const TotalAssignedContext = createContext(0);

const SetTotalAssignedContext = createContext<Dispatch<SetStateAction<number>> | null>(null);

export function AssignmentsTabCountProvider({ children }: { children: ReactNode }) {
  const [total, setTotal] = useState(0);
  return (
    <SetTotalAssignedContext.Provider value={setTotal}>
      <TotalAssignedContext.Provider value={total}>{children}</TotalAssignedContext.Provider>
    </SetTotalAssignedContext.Provider>
  );
}

export function useAssignmentsTabTotal(): number {
  return useContext(TotalAssignedContext);
}

export function useReportAssignmentsTabTotal(): Dispatch<SetStateAction<number>> {
  const setTotal = useContext(SetTotalAssignedContext);
  if (!setTotal) {
    throw new Error("useReportAssignmentsTabTotal must be used within AssignmentsTabCountProvider");
  }
  return setTotal;
}
