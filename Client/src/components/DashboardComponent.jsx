import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios"; // Đảm bảo bạn đã import axios
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiBookOpen,
  HiOutlineUserGroup,
} from "react-icons/hi";

export default function DashboardComponent() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [books, setBooks] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthBooks, setLastMonthBooks] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);

  // Tính toán thời gian 30 ngày trước
  const getLastMonthDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString(); // Format thành ISO string để truyền vào API
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users/statistic`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            dateFilter: getLastMonthDate(), // Truyền thời gian 30 ngày trước vào API
          },
        });
        if (response.data) {
          setUsers(response.data.users);
          setTotalUsers(response.data.totalUsers);
          setLastMonthUsers(response.data.lastMonthUsers);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchBooks = async () => {
      try {
        const response = await axios.get(`/api/booksold/sold-books`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            dateFilter: getLastMonthDate(), // Truyền thời gian 30 ngày trước vào API
          },
        });
        if (response.data) {
          setBooks(response.data.books);
          setTotalBooks(response.data.totalSoldBooks);
          setLastMonthBooks(response.data.lastMonthSoldBooks);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/comments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            dateFilter: getLastMonthDate(), // Truyền thời gian 30 ngày trước vào API
          },
        });
        if (response.data) {
          setComments(response.data.comments);
          setTotalComments(response.data.totalComments);
          setLastMonthComments(response.data.lastMonthComments);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    if (currentUser.isAdmin) {
      fetchUsers();
      fetchBooks();
      fetchComments();
    }
  }, [currentUser]);

  return (
    <div className="p-3 md:mx-auto">
      <div className="flex-wrap flex gap-4 justify-center">
        {/* Total Users */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Total Users</h3>
              <p className="text-2xl">{totalUsers}</p>
            </div>
            <HiOutlineUserGroup className="bg-teal-600  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex  gap-2 text-sm">
            <span
              className={`flex items-center ${
                lastMonthUsers > 0 ? "dark:text-lime-300 text-green-700" : ""
              }`}
            >
              <HiArrowNarrowUp />
              {lastMonthUsers}
            </span>
            <div className="text-gray-500">Last month</div>
          </div>
        </div>

        {/* Total Comments */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">
                Total Comments
              </h3>
              <p className="text-2xl">{totalComments}</p>
            </div>
            <HiAnnotation className="bg-violet-400  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex  gap-2 text-sm">
            <span
              className={`flex items-center ${
                lastMonthComments > 0 ? "dark:text-lime-300 text-green-700" : ""
              }`}
            >
              <HiArrowNarrowUp />
              {lastMonthComments}
            </span>
            <div className="text-gray-500">Last month</div>
          </div>
        </div>

        {/* Total Books */}
        <div className="flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md">
          <div className="flex justify-between">
            <div className="">
              <h3 className="text-gray-500 text-md uppercase">Total Books</h3>
              <p className="text-2xl">{totalBooks}</p>
            </div>
            <HiBookOpen className="bg-lime-500  text-white rounded-full text-5xl p-3 shadow-lg" />
          </div>
          <div className="flex  gap-2 text-sm">
            <span
              className={`flex items-center ${
                lastMonthBooks > 0 ? "dark:text-lime-300 text-green-700" : ""
              }`}
            >
              <HiArrowNarrowUp />
              {lastMonthBooks}
            </span>
            <div className="text-gray-500">Last month</div>
          </div>
        </div>
      </div>
    </div>
  );
}
