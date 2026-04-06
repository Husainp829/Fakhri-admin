import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import storage from "@/firebase-config";
import { getApiUrl } from "@/constants";
import { getToken } from "./http-client";

/** Typical react-admin `FileInput` value */
export type RaFileInputValue = {
  title?: string;
  rawFile: File;
  [key: string]: unknown;
};

export type UploadProgress = { name: string; value: number };

export default async function uploadPropsTransform(
  data: Record<string, unknown>,
  notify: (message: string, type?: string | number) => void,
  type: string
): Promise<Record<string, unknown>> {
  const obj = { ...data };
  const image = obj.image;
  if (image != null && typeof image === "object") {
    obj.image = await uploadMedia(image as RaFileInputValue, notify, type);
  }
  return obj;
}

export const uploadToFirebase = async (
  file: RaFileInputValue,
  setProgress: (p: UploadProgress) => void
): Promise<string> =>
  new Promise((resolve, reject) => {
    const storageRef = ref(storage, `/files/${file.title ?? "file"}`);
    const uploadTask = uploadBytesResumable(storageRef, file.rawFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress({ name: file.title ?? "file", value: percent });
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });

export const uploadMedia = async (
  file: RaFileInputValue,
  _notify: (message: string, type?: string | number) => void,
  _type: string
): Promise<unknown> => {
  const formData = new FormData();
  formData.append("type", _type);
  formData.append("file", file.rawFile);
  const token = await getToken();
  const response = await axios({
    method: "post",
    url: `${getApiUrl("media")}/media/upload`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      authorization: token,
    },
  });
  return (response.data as { image?: unknown }).image;
};

export const uploadBase64Media = async (file: string): Promise<unknown> => {
  const spl = file.split(",").pop();
  const token = await getToken();
  const response = await axios({
    method: "post",
    url: `${getApiUrl("itsdata")}/itsdata/upload`,
    data: {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      base64Image: spl,
    },
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
  });
  return (response.data as { image?: unknown }).image;
};
