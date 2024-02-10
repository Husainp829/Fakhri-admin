/* eslint-disable no-console */
import React, { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageResize = () => {
  const [src, setSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [cropRef, setCrop] = useState({
    unit: "px",
    width: 350,
    aspect: 1,
  });

  const [imageRef, setImage] = useState(null);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // If you setState the crop in here you should return false.
  const onImageLoaded = (image) => {
    setImage(image);
  };

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const makeClientCrop = async (crop) => {
    if (imageRef && crop.width && crop.height) {
      const cropped = await getCroppedImg(imageRef, crop, "newFile.jpeg");

      console.log(cropped);
      setCroppedImageUrl(cropped);
    }
  };
  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          const bl = blob;
          if (!bl) {
            console.error("Canvas is empty");
            reject(new Error("Canvas is empty"));
            return;
          }
          bl.name = fileName;
          const file = window.URL.createObjectURL(blob);
          resolve(file);
        },
        "image/jpeg",
        1
      );
    });
  };

  return (
    <div className="App">
      <div>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>
      {src && (
        <ReactCrop
          style={{ width: "100%", maxWidth: "750px" }}
          src={src}
          crop={cropRef}
          ruleOfThirds
          onImageLoaded={onImageLoaded}
          onComplete={onCropComplete}
          onChange={onCropChange}
        />
      )}
      {croppedImageUrl && <img alt="Crop" style={{ maxWidth: "100%" }} src={croppedImageUrl} />}
    </div>
  );
};

export default ImageResize;
