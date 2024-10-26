import { Sidebar, Modal, Button } from "flowbite-react";
import "react-circular-progressbar/dist/styles.css";
import React from "react";
import {
  HiUser,
  HiOutlineExclamationCircle,
  HiArrowSmRight,
  HiBookOpen,
  HiOutlineUserGroup,
  HiChartPie,
  HiAnnotation,
  HiOutlineShoppingBag,
  HiOutlineArchive,
  HiStatusOnline,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { signOutSuccess } from "../redux/user/UserSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import axios from "axios";

import NotificationBadge from "./NotificationBadge";
export default function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();
  // Hàm lấy số lượng pending books
  const fetchPendingBooksCount = async () => {
    try {
      if (currentUser.isAdmin) {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/booksold/pending`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPendingCount(response.data.length); // Giả sử response.data là mảng các sách pending
      } else {
      }
    } catch (error) {
      console.error("Error fetching pending books count:", error);
    }
  };
  useEffect(() => {
    fetchPendingBooksCount();
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (!searchParams.has("tab")) {
      navigate("/dashboard?tab=dash", { replace: true });
    }
    if (!tab) {
      navigate("/dashboard?tab=dash", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleLogout = () => {
    try {
      setShowModal(false);
      localStorage.removeItem("token");
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
      <Sidebar className="w-full md:w-56">
        <Sidebar.Items>
          <Sidebar.ItemGroup className="flex flex-col gap-2">
            {currentUser && currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "dash" || !tab}
                icon={HiChartPie}
                to="/dashboard?tab=dash"
                as={Link}
              >
                Dashboard
              </Sidebar.Item>
            )}
            <Sidebar.Item
              active={tab === "profile"}
              as={Link}
              to="/dashboard?tab=profile"
              icon={HiUser}
              label={currentUser.isAdmin ? "admin" : "user"}
              labelColor="dark"
            >
              Profile
            </Sidebar.Item>
            {currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "books"}
                icon={HiBookOpen}
                to="/dashboard?tab=books"
                as={Link}
              >
                Books
              </Sidebar.Item>
            )}
            {!currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "books-in-progress"}
                icon={HiStatusOnline}
                to="/dashboard?tab=books-in-progress"
                as={Link}
              >
                In progress
              </Sidebar.Item>
            )}
            {!currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "user-bought-books"}
                icon={HiBookOpen}
                to="/dashboard?tab=user-bought-books"
                as={Link}
              >
                Bought-Book
              </Sidebar.Item>
            )}

            {currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "users"}
                icon={HiOutlineUserGroup}
                to="/dashboard?tab=users"
                as={Link}
              >
                Users
              </Sidebar.Item>
            )}
            {currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "comments"}
                icon={HiAnnotation}
                to="/dashboard?tab=comments"
                as={Link}
              >
                Comments
              </Sidebar.Item>
            )}
            {currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "pending-books"}
                icon={HiOutlineShoppingBag}
                to="/dashboard?tab=pending-books"
                as={Link}
                className="relative" // Để đảm bảo vị trí badge tương đối với phần tử này
              >
                Pending Books
                {pendingCount > 0 && <NotificationBadge count={pendingCount} />}
              </Sidebar.Item>
            )}
            {currentUser.isAdmin && (
              <Sidebar.Item
                active={tab === "books-history"}
                icon={HiOutlineArchive}
                to="/dashboard?tab=books-history"
                as={Link}
              >
                Books History
              </Sidebar.Item>
            )}
            <Sidebar.Item
              onClick={() => setShowModal(true)}
              className="cursor-pointer"
              icon={HiArrowSmRight}
            >
              Sign Out
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
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
