import React from "react";
import {
  TextInput,
  Edit,
  SimpleForm,
  Title,
  FileInput,
  FileField,
  FormDataConsumer,
  useNotify,
  useUpdate,
} from "react-admin";
import DateTimeInput from "../../components/DateTimeInput";
import { uploadMedia } from "../../dataprovider/uploadProps";
import { formatDateTime, parseDateTime } from "../../utils";

export default (props) => {
  const EventTitle = () => "Event Details";
  const notify = useNotify();
  const [update] = useUpdate();
  const save = async (data) => {
    let imageUrl = data.image;
    try {
      if (data.image instanceof Object) {
        imageUrl = await uploadMedia(data.image, "event");
      }
    } catch (error) {
      notify("File is too large. max allowed size (100kb)", { type: "warning" });
      return;
    }
    await update(
      "events",
      { id: data.id, data: { ...data, image: imageUrl } },
      { returnPromise: true }
    )
      .then(() => {
        notify("Event Updated");
      })
      .catch((err) => {
        console.error(err);
        notify("Something wrong happened. please try again", { type: "warning" });
      });
  };
  return (
    <>
      <Title title="" />
      <Edit {...props} redirect="" mutationMode="optimistic" title={<EventTitle />}>
        <SimpleForm onSubmit={save} sx={{ maxWidth: 500 }}>
          <TextInput source="name" fullWidth helperText={false} />
          <DateTimeInput
            source="fromDate"
            label="From"
            parse={parseDateTime}
            format={formatDateTime}
            options={{ ampmInClock: false, clearable: true }}
          />
          <DateTimeInput
            source="toDate"
            label="To"
            parse={parseDateTime}
            format={formatDateTime}
            options={{ ampmInClock: false, clearable: true }}
          />
          <FileInput
            source="image"
            label="image"
            accept="image/*"
            placeholder={<p>Drop your file here</p>}
            helperText={
              <span>
                Please upload an image of the following specifications - <br />
                <ol>
                  <li>type:- PNG/JPG/JPEG</li>
                  <li> size:- less than 100kb</li>
                </ol>
              </span>
            }
          >
            <FileField source="src" title="title" />
          </FileInput>
          <FormDataConsumer>
            {({ formData }) =>
              formData.image &&
              typeof formData.image === "string" && (
                <img src={formData.image} alt={formData.image} width="100px" />
              )
            }
          </FormDataConsumer>
        </SimpleForm>
      </Edit>
    </>
  );
};
