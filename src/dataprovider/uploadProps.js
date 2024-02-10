/* eslint-disable no-unused-vars */
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";
import storage from "../firebaseConfig";
import { apiUrl } from "../constants";
import { getToken } from "./httpClient";

export default async (data, notify, type) => {
  const obj = data;
  if (obj.image instanceof Object) {
    obj.image = await uploadMedia(obj.image, notify, type);
  }
  return obj;
};

export const uploadToFirebase = async (file, setProgress) => {
  const promise = new Promise((resolve, reject) => {
    const storageRef = ref(storage, `/files/${file.title}`);
    const uploadTask = uploadBytesResumable(storageRef, file.rawFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress({ name: file.title, value: percent });
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref).then((link) => link);
        resolve(url);
      }
    );
  });

  return promise;
};

export const uploadMedia = async (file, notify, type) => {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file.rawFile);
  const token = await getToken();
  return axios({
    method: "post",
    url: `${apiUrl}/media/upload`,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      authorization: token,
    },
  }).then((response) => response.data.image);
};

export const uploadBase64Media = async (file) => {
  const spl = file.split(",").pop();
  const token = await getToken();
  return axios({
    method: "post",
    url: `${apiUrl}/itsdata/upload`,
    data: {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      base64Image: spl,
    },
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
  }).then((response) => response.data.image);
};
