import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import StarRating from "../components/StarRating";
import "../styles/BookItem.css";
import { Modal, Button } from "flowbite-react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import QRCodeImage from "../assets/QRCode.jpg";
import { useNavigate } from "react-router-dom";

const BookItem = ({ book }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState({});
  const [hotBooks, setHotBooks] = useState([]);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const rating = 4;
  const isSeeMore = book.content.split(" ").length > 150;
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { userId, username } = parseJwt(token);
      setCurrentUserId(userId);
    }

    const fetchBookSold = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/booksold/${book.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCurrentBook(response.data);
      } catch (error) {
        console.error("Error fetching book sold data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookSold();
  }, [book.id, currentUser]);

  useEffect(() => {
    const fetchHotBooks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/starsrating/hot-books`
        );
        setHotBooks(response.data);
      } catch (error) {
        console.error("Error fetching book sold data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotBooks();
  }, []);

  const parseJwt = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userId =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
      const username =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];

      return { userId, username };
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentBook) {
    return <div>Book not found!</div>;
  }
  const isApproved = currentBook.status === "Approved";
  const isCurrentUserOwner = currentBook.userId === currentUserId;

  const handleSeeMore = () => {
    document.getElementById("see-more-btn").style.display = "none";
    document.getElementById("book-desc").classList.remove("text-limit");
  };
  const BuyBook = async () => {
    if (!currentUser) {
      toast.error("You have to log in to buy books!");
      return;
    }
    const BookId = book.id;
    const Title = book.title;
    const Price = book.price;
    const Image = book.image;
    const Genre = book.genre;
    const Slug = book.slug;
    const UserId = currentUser.id;
    const Username = currentUser.username;
    const Email = currentUser.email;
    const value = {
      BookId,
      Title,
      Price,
      UserId,
      Username,
      Email,
      Image,
      Genre,
      Slug,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/booksold`,
        value,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success(response.data);
        navigate("/");
      } else if (response.status === 400) {
        toast.error(response.data);
      } else if (response.status === 403) {
        toast.error("You are not authorized to buy this book.");
      } else {
        throw new Error("Fail to buy this book. Please contact admin.");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data);
      } else {
        toast.error("Fail to buy this book. Please contact admin.");
      }
      console.error("Cannot buy this book:", error);
    }
  };

  const toggleImageZoom = () => {
    setIsImageZoomed(!isImageZoomed);
  };
  const handleReadingBook = () => {
    navigate(`/books/reading?book=${book.slug}`);
  };
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <div className="col-span-1">
          <div className="flex justify-center">
            <div className="mx-auto">
              <img
                className="w-56 max-h-80 h-auto"
                src={book.image}
                alt={book.title}
              />
              <div className="p-1 mt-2">
                <p>
                  <strong>Author: </strong> {book.author}
                </p>
                <p>
                  <strong>Genre: </strong> {book.genre}
                </p>
                <p>
                  <strong>Price: </strong>${book.price}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2">
          <h2 className="text-2xl text-center font-bold text-gray-800 uppercase">
            {book.title}
          </h2>

          <hr className="border-t-2 my-1" />

          <StarRating bookInfos={book} userId={currentUserId} />

          <div id="book-desc" className="text-base mt-2 text-limit">
            <ReactMarkdown>{book.content}</ReactMarkdown>
          </div>

          {isSeeMore && (
            <button
              id="see-more-btn"
              className="text-dark font-semibold px-1 rounded float-right"
              onClick={handleSeeMore}
            >
              See more...
            </button>
          )}

          <div className="text-center mt-2 p-3">
            {isApproved && isCurrentUserOwner ? (
              <button
                className="bg-blue-500 hover:bg-blue-600
               text-white font-bold py-2 px-4 m-1 
               rounded transition duration-200"
                onClick={() => handleReadingBook()}
              >
                Read Book
              </button>
            ) : (
              <button
                className="bg-red-500 hover:bg-red-600
                                 text-white font-bold py-2 px-4 m-1
                                  rounded transition duration-200"
                onClick={() => setIsModalOpen(true)}
              >
                Buy Book
              </button>
            )}
          </div>
        </div>

        <div className="col-span-1 hidden lg:block">
          <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4 uppercase border-b-2 border-dark inline-block pb-2">
            Hot Books
          </h2>

          <ul>
            {hotBooks.slice(0, 5).map((book, index) => (
              <li key={index} className="mt-2">
                <div className="flex items-center">
                  <div
                    className={`flex-none bg-${
                      index === 0
                        ? "red"
                        : index === 1
                        ? "green"
                        : index === 2
                        ? "blue"
                        : index == 3
                        ? "gray"
                        : "white"
                    }-500 border border-transparent rounded-full w-8 h-8 flex items-center justify-center`}
                  >
                    <p
                      className={`text-${index === 3 ? "dark" : "white"} bold`}
                    >
                      {index + 1}
                    </p>
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-lg">
                      {book?.bookDetails?.title ?? "None"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {book?.bookDetails?.genre ?? "None"}
                    </p>
                  </div>
                </div>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Modal show={isModalOpen} size="md" onClose={() => setIsModalOpen(false)}>
        <Modal.Header className="">
          Confirm Purchase - Click this QR code{" "}
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col items-center">
            <img
              src={QRCodeImage}
              alt="QR Code"
              className="mx-auto cursor-pointer"
              style={{ width: "200px", height: "200px" }}
              onClick={toggleImageZoom}
            />

            <p className="text-center">
              Scan this QR code to confirm your purchase.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex flex-row self-center">
          <Button className="bg-green-500 text-white" onClick={BuyBook}>
            Confirm
          </Button>
          <Button
            className="bg-gray-500 text-white"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      {isImageZoomed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          style={{ zIndex: 1050 }} // Đảm bảo z-index cao hơn modal QR Code
          onClick={toggleImageZoom}
        >
          <img
            src={QRCodeImage}
            alt="QR Code"
            className="max-w-full max-h-full cursor-pointer"
          />
        </div>
      )}
    </>
  );
};

export default BookItem;
