import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import NotFound from "./NotFound";
import BookItem from "../components/BookItem";
import Comment from "../components/Comment";
import Breadcrumb from "../components/Breadcrumb";
import CommentSection from "../components/CommentSection";

const BookDetail = () => {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5173/api/books/${slug}`);
        const data = await response.json();
        setBook(data);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [slug]);

  if (loading) {
    return <div className="container mx-auto">Loading...</div>;
  }

  if (!book) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto">
      <Breadcrumb book={book} />

      <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4 uppercase border-b-2 border-dark inline-block pb-2">
        Book Information
      </h2>

      <BookItem book={book} />

      <h2
        className="text-xl font-bold text-gray-800 
                    mb-4 mt-7 uppercase border-b-2 border-dark 
                    inline-block pb-2 ml-80"
      >
        Comments
      </h2>

      <CommentSection bookId={book.id} />
    </div>
  );
};

export default BookDetail;
