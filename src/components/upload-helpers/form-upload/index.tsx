import { Button, useCreate } from "react-admin";

const forms: Record<string, unknown>[] = [];

export default function FormUploadButton() {
  const [create] = useCreate();

  const onUploadITS = () => {
    forms.map(async (s) => {
      const created = await create("niyaaz", {
        data: {
          ...s,
          familyMembers: [],
        },
      });

      return created;
    });
  };

  return <Button onClick={onUploadITS}> upload Forms</Button>;
}
