import React, { useEffect, useState } from "react";

import { BookSlider } from "../components/BookSlider";
import { Banner } from "../components/Banner";
import ReaderForm from "../components/ReaderForm";
import JoinUs from "../components/JoinUs";
import axios from "axios";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [hotBooks, setHotBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  console.log(">>> check hot books: ", hotBooks);
  const fetchData = async () => {
    const response = await fetch("/api/books");
    const result = await response.json();

    setBooks(result);
    setLoading(false);
  };

  useEffect(() => {
    const fetchHotBooks = async () => {
      try {
        const response = await axios.get(`/api/starsrating/hot-books`);
        setHotBooks(response.data);
      } catch (error) {
        console.error("Error fetching book sold data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHotBooks();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="container mx-auto">
        <div>Loading...</div>
      </div>
    );
  const hotBooksArray = hotBooks.map((book) => book.bookDetails);
  const settings = {
    dots: false,
    infinite: true, // Loop through slides
    speed: 500, // Slide transition speed in milliseconds
    slidesToShow: 6, // Number of slides to show at a time
    slidesToScroll: 1, // Number of slides to scroll at a time
  };

  return (
    <div className="container mx-auto">
      <Banner />

      <div className="hot mx-4">
        <h2 className="font-bold my-6 text-xl uppercase">Hot Books 🔥</h2>
        <BookSlider key={hotBooksArray.length} books={hotBooksArray} />
      </div>

      <div className="new mx-4">
        <h2 className="font-bold my-6 text-xl uppercase">New Books ⚡</h2>
        <BookSlider books={books} />
      </div>

      <div className="join-us m-4">
        <JoinUs />
      </div>

      <div className="reader-form m-6">
        <ReaderForm />
        <br />
      </div>
    </div>
  );
};

export default Home;
