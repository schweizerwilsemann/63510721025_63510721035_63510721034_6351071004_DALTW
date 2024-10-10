import {
  Modal,
  Form,
  Input,
  Button,
  message,
  InputNumber,
  Spin,
  Flex,
} from "antd";
import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload } from "antd";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { app } from "../firebase";
import {} from "antd";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const ModalUpdateBook = ({ open, onCancel, onUpdate, book }) => {
  const [form] = Form.useForm();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
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

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const { username, title, author, genre, price, content, publishedYear } =
      values;

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

      const bookInfos = {
        publishedYear: publishedYear,
        username: username,
        image: imageUrl ?? `${book.image}`,
        pdfUrl: pdfUrl ?? `${book.pdfUrl}`,
        title: title,
        author: author,
        genre: genre,
        price: price,
        content: content,
      };
      const response = await axios.put(
        `/api/books/update/${book.id}`,
        bookInfos,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (
        response.status === 201 ||
        response.status === 200 ||
        response.status === 204
      ) {
        toast.success("Book updated successfully!");
        // Call the onUpdate callback to notify the parent and close the modal
        onUpdate();

        // Reset the form fields
        form.resetFields();
      } else {
        throw new Error("Failed to updated book");
      }
    } catch (error) {
      toast.error("Failed to updated book. Please try again.");
      console.error("Error updating book:", error);
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
  useEffect(() => {
    if (book) {
      form.setFieldsValue({
        title: book.title,
        author: book.author,
        genre: book.genre,
        publishedYear: book.publishedYear,
        price: book.price,
        content: book.content,
      });
    }
  }, [book, form]);

  return (
    <>
      {!currentUser || currentUser.isAdmin !== true ? (
        <div className="">not found</div>
      ) : (
        <Modal
          width={`75rem`}
          title={<span className=" text-3xl font-semibold">Update Book</span>}
          open={open}
          onCancel={onCancel}
          footer={[
            <Flex key="footer" justify="center">
              <Button key="cancel" onClick={onCancel}>
                Cancel
              </Button>
              ,
              <Button
                key="submit"
                type="primary"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? <Spin /> : "Update"}
              </Button>
              ,
            </Flex>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            name="update_book"
            onFinish={handleSubmit}
          >
            <Form.Item name="image" key="image" label="Upload Image">
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
                alt={book.image}
              />
            )}

            {/* Upload PDF */}
            <Form.Item name="file" key="file" label="Upload File (PDF)">
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
              key="title"
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please input the title!" }]}
            >
              <Input type="" />
            </Form.Item>
            <Form.Item
              key="author"
              name="author"
              label="Author"
              rules={[{ required: true, message: "Please input the author!" }]}
            >
              <Input type="" />
            </Form.Item>
            <Form.Item
              key="genre"
              name="genre"
              label="Genre"
              rules={[{ required: true, message: "Please input the genre!" }]}
            >
              <Input type="" />
            </Form.Item>
            <Form.Item
              key="publishedYear"
              name="publishedYear"
              label="Published Year"
              rules={[{ required: true, message: "Please input the year!" }]}
            >
              <InputNumber
                min={0}
                step={1}
                onChange={(value) => {
                  if (!Number.isInteger(value)) {
                    toast.error("Please input right year");
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              key="price"
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
              key="content"
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
          </Form>
        </Modal>
      )}
    </>
  );
};

export default ModalUpdateBook;
