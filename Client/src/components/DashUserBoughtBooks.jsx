import { Button, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import axios from "axios";

export default function DashUserBoughtBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/booksold/user/bought-books`,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!res) {
        setLoading(false);
        return;
      }
      setBooks(res.data);
      setLoading(false);
      setShowMore(res.data.length === 6);
    };

    fetchBooks();
  }, []);

  const handleShowMore = async () => {
    const startIndex = books.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const res = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/books/search?${urlParams.toString()}`
    );
    if (!res.ok) return;

    const data = await res.json();
    setBooks([...books, ...data.books]);
    setShowMore(data.books.length === 6);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Your books:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {loading && <p>Loading...</p>}
          {!loading && books.length === 0 && <p>No books found!</p>}
          {!loading &&
            books.map((book) => <BookCard key={book.id} book={book} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-teal-500 text-lg hover:underline p-7 w-full"
            >
              Show more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
