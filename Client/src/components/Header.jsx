import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Navbar,
  TextInput,
  Dropdown,
  Modal,
} from "flowbite-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AiOutlineSearch } from "react-icons/ai";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaMoon, FaSun } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import { signOutSuccess } from "../redux/user/UserSlice.js";

export default function Header() {
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    console.log();
    const searchTermFromUrl = urlParams.get("searchTerm");
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  console.log(">>> check current user: ", currentUser);

  const handleLogout = () => {
    try {
      setShowModal(false);
      localStorage.removeItem("persist:root");
      dispatch(signOutSuccess());
      navigate("/");
    } catch (error) {
      console.log(">>> Logout failed! ", error.message);
    }
  };
  const handleConfirmLogout = () => {
    handleLogout();
    setShowModal(false);
  };
  return (
    <>
      <Navbar className="border-b-2 ">
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
        <form
          onSubmit={handleSubmit}
          className="flex-grow max-w-md sm:max-w-lg lg:max-w-xl mx-auto"
        >
          <TextInput
            type="text"
            placeholder="Search something...."
            rightIcon={AiOutlineSearch}
            className="hidden lg:inline"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </form>

        <div className="flex gap-2 md:order-2">
          <Button className="w-12 h-10 hidden sm:inline ml-3" color="red" pill>
            <FaSun />
          </Button>
          {currentUser ? (
            <Dropdown
              arrowIcon="false"
              inline
              label={
                <Avatar
                  alt="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  img={`${currentUser.photoURL}`}
                  rounded
                />
              }
            >
              <Dropdown.Header>
                <span className=" block text-sm">
                  <span className="font-bold">Username:</span> &nbsp;
                  {currentUser.username}{" "}
                </span>
                <span className=" block text-sm truncate">
                  <span className="font-bold">Email: </span> &nbsp;
                  {currentUser.email}{" "}
                </span>
              </Dropdown.Header>
              <Link to={"/dashboard?tab=profile"}>
                <Dropdown.Item>Profile</Dropdown.Item>
              </Link>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => setShowModal(true)}>
                Sign Out
              </Dropdown.Item>
            </Dropdown>
          ) : (
            <Link to="/sign-in">
              <Button gradientDuoTone="redToYellow">Sign In</Button>
            </Link>
          )}

          <Navbar.Toggle className="text-white bg-orange-400 hover:bg-orange-500" />
        </div>
        <Navbar.Collapse>
          <Navbar.Link as={`div`} active={path === "/"}>
            <Link to="/">Home</Link>
          </Navbar.Link>
          <Navbar.Link as={`div`} active={path === "/about"}>
            <Link to="/about">About</Link>
          </Navbar.Link>
          <Navbar.Link as={`div`} active={path === "/projects"}>
            <Link to="/projects">Projects</Link>
          </Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure to log out?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              className="bg-blue-600"
              onClick={() => handleConfirmLogout()}
            >
              Yes, I'm Sure
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              No, cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
