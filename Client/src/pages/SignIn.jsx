import React, {useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex } from 'antd';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/UserSlice';
import { toast, ToastContainer } from "react-toastify";

export default function SignIn() {

  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isToastVisible, setIsToastVisible] = useState(false);


  const onFinish = async (values) => {
    console.log(">>> check values: ", values);
    try {
        dispatch(signInStart());
        const response = await axios.post('/api/auth/login', values);
        dispatch(signInSuccess(response));
        toast.success('Login Successfully')
        navigate("/");

    } catch (error) {
        if (error.response && error.response.status === 401) {
          if(!isToastVisible){
            toast.error('Invalid username or password');
            setIsToastVisible(true);
            setTimeout(() => setIsToastVisible(false), 3000); 
            dispatch(signInFailure(error.response));
          }
          setError('Invalid username or password');
        } else {
          if (!isToastVisible) {
            toast.error('An unexpected error occurred. Please try again later.');
            setIsToastVisible(true);
            dispatch(signInFailure(error.response));
            setTimeout(() => setIsToastVisible(false), 3000);
          }
          setError('An unexpected error occurred. Please try again later.');
        }
        console.error(">>>Login failed", error);
    }
};

  return (
    <>
      <div className="min-h-screen mt-20">
        <div className="flex flex-col p-3 max-w-3xl mx-auto md:flex-row md:items-center gap-5">
          {/* left side */}
          <div className='flex-1'>
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
            <p className='text-sm mt-5'>
              This is a novel website
            </p>
          </div>
          {/* right side */}
          <div className="flex-1">
          <Form
            name="login"
            initialValues={{
              remember: true,
            }}
            style={{
              maxWidth: 360,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your Username!',
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
                  message: 'Please input your Password!',
                },
              ]}
            >
              <Input prefix={<LockOutlined />} type="password" placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <Link to={""}>Forgot password</Link>
              </Flex>
            </Form.Item>

            <Form.Item>
              <Button 
                className="bg-orange-400 text-sky-50" 
                style={{}} 
                block 
                type="" 
                htmlType="submit"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFFF00')} // Màu nền khi hover
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}  
              >
                Log in
              </Button>
              or <Link className="font-semibold text-rose-400" to={"/sign-up"}>Register now!</Link>
            </Form.Item>
          </Form>
          </div>
        </div>
    
      </div>
    </>
  );
}
