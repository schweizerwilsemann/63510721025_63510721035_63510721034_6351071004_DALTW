import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload } from "antd";
import {
  Button,
  Flex,
  Form,
  Input,
  DatePicker,
  InputNumber,
  message,
} from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { app } from "../firebase";
import { Spin } from "antd";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export const UploadBook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imageFileList, setImageFileList] = useState([]); // Danh sách file ảnh
  const [pdfFileList, setPdfFileList] = useState([]); // Danh sách file PDF
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.isAdmin !== true) {
      navigate("/404-not-found");
    }
  }, [currentUser, navigate]);

  const handleImageChange = async ({ fileList: newFileList }) => {
    setImageFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[newFileList.length - 1].originFileObj;
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    }
  };

  const handlePdfChange = async ({ fileList: newFileList }) => {
    setPdfFileList(newFileList);
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  const handleSubmit = async (values) => {
    const { username, title, author, genre, price, content } = values;

    let imageUrl = null;
    let pdfUrl = null;

    try {
      // Upload ảnh
      if (imageFileList.length > 0) {
        const imageFile = imageFileList[imageFileList.length - 1].originFileObj;
        setIsUploading(true);
        imageUrl = await uploadToFirebase(imageFile, "images");
        setIsUploading(false);
      }

      // Upload PDF
      if (pdfFileList.length > 0) {
        const pdfFile = pdfFileList[pdfFileList.length - 1].originFileObj;
        setIsUploading(true);
        pdfUrl = await uploadToFirebase(pdfFile, "pdfs");
        setIsUploading(false);
      }

      const post_infos = {
        published_year: values.published_year.$y,
        username: username,
        image: imageUrl,
        pdfURL: pdfUrl,
        title: title,
        author: author,
        genre: genre,
        price: price,
        content: content,
      };

      const response = await axios.post("/api/books", post_infos, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 201) {
        toast.success("Book uploaded successfully!");
        navigate("/");
      } else {
        throw new Error("Failed to upload book");
      }
    } catch (error) {
      toast.error("Failed to upload book. Please try again.");
      console.error("Error uploading book:", error);
      setIsUploading(false);
    }
  };

  const uploadToFirebase = async (file, folder) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed:", error);
          toast.error("Upload failed. Please try again.");
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  return (
    <>
      {!currentUser || currentUser.isAdmin !== true ? (
        <div className="">not found</div>
      ) : (
        <Form
          form={form}
          initialValues={{
            username: currentUser.username,
            price: 0.0,
          }}
          scrollToFirstError
          style={{
            paddingBlock: 32,
          }}
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 14,
          }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="User Upload"
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Input type="" disabled={true} />
          </Form.Item>

          {/* Upload ảnh */}
          <Form.Item name="image" label="Upload Image">
            <Upload
              customRequest={({ onSuccess }) => onSuccess("ok")}
              action={""}
              listType="picture-card"
              fileList={imageFileList}
              onChange={handleImageChange}
            >
              {imageFileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          {/* Hiển thị ảnh preview */}
          {previewImage && (
            <Image
              wrapperStyle={{
                display: "none",
              }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
              src={previewImage}
            />
          )}

          {/* Upload PDF */}
          <Form.Item name="file" label="Upload File (PDF)">
            <Upload
              customRequest={({ onSuccess }) => onSuccess("ok")}
              action={null}
              fileList={pdfFileList}
              onChange={handlePdfChange}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith("image/");
                const isPDF = file.type === "application/pdf";
                if (!isImage && !isPDF) {
                  message.error("You can only upload image or PDF file!");
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
            >
              {pdfFileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="" />
          </Form.Item>
          <Form.Item
            name="author"
            label="Author"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="" />
          </Form.Item>
          <Form.Item
            name="published_year"
            label="Published Year"
            rules={[
              {
                required: true,
              },
            ]}
            getValueFromEvent={DatePicker.$y}
          >
            <DatePicker picker="year" />
          </Form.Item>
          <Form.Item
            name="genre"
            label="Genre"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input type="" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber
              min={0}
              formatter={(price) =>
                `$ ${price}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(price) => price?.replace(/\$\s?|(,*)/g, "")}
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.TextArea rows={10} />
          </Form.Item>
          <Flex justify="center">
            <Button type="primary" htmlType="submit" disabled={isUploading}>
              {isUploading ? <Spin /> : "Submit"}
            </Button>
          </Flex>
        </Form>
      )}
    </>
  );
};
