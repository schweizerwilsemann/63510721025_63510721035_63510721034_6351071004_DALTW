import React, { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload } from "antd";
import { Button, Flex, Form, Input, DatePicker, InputNumber } from "antd";
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
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.isAdmin !== true) {
      navigate("/404-not-found");
    }
  }, [currentUser, navigate]);

  const handleChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
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

    try {
      if (fileList.length > 0) {
        const file = fileList[fileList.length - 1].originFileObj;
        setIsUploading(true);
        imageUrl = await uploadToFirebase(file);
        setIsUploading(false);
      }

      const post_infos = {
        published_year: values.published_year.$y,
        username: username,
        image: imageUrl,
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

  const uploadToFirebase = async (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error("Upload failed:", error);
          toast.error("Upload failed. Please try again.");
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL); // return URL
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
          <Form.Item name="image" label="Upload Image">
            <Upload
              action={""}
              listType="picture-card"
              fileList={fileList}
              onChange={handleChange}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
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

          <Form.Item
            wrapperCol={{
              offset: 6,
            }}
          >
            <Flex gap="small">
              {isUploading && <Spin />}
              <Button
                className="bg-orange-400 text-sky-50"
                htmlType="submit"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#FFFF00")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f97316")
                }
              >
                Upload
              </Button>
              <Button danger onClick={() => form.resetFields()}>
                Reset
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      )}
    </>
  );
};
