import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Flex } from "antd";
import axios from "axios";

export default function SignIn() {
  const navigate = useNavigate();
  const onFinish = async (values) => {
    console.log("Received values of form: ", values);

    const response = await axios.post("/api/auth/signup", values);
    navigate("/sign-in");
  };
  return (
    <>
      <div className="min-h-screen mt-20">
        <div className="flex flex-col p-3 max-w-3xl mx-auto md:flex-row md:items-center gap-5">
          {/* left side */}
          <div className="flex-1">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-sm 
                sm:text-xl font-semibold dark:text-white"
            >
              <span
                className="ml-0 px-5 py-4 bg-gradient-to-r from-rose-400
                    via-orange-300 to bg-yellow-100 text-purple-600"
              >
                ユニクロ
              </span>
              E-Books
            </Link>
            <p className="text-sm mt-5">This is a novel website</p>
          </div>
          {/* right side */}
          <div className="flex-1">
            <Form
              name="register"
              initialValues={{
                remember: true,
              }}
              style={{
                maxWidth: 360,
              }}
              onFinish={onFinish}
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please input your Email!",
                  },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your Username!",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder="Username" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The new password that you entered do not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  className="bg-orange-400 text-sky-50"
                  style={{}}
                  block
                  type=""
                  htmlType="submit"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#FFFF00")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f97316")
                  }
                >
                  Register
                </Button>
                Already have an account?{" "}
                <Link className="font-semibold text-rose-400" to={"/sign-in"}>
                  Login!
                </Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
