declare module "jsonexport/dist" {
  function jsonExport(
    data: unknown,
    options: { headers: string[] },
    callback: (err: unknown, csv: string) => void
  ): void;
  export default jsonExport;
}
