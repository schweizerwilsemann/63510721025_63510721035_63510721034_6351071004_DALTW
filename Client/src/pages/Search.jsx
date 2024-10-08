import { Button, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    genres: "none",
  });

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const genreFromUrl = urlParams.get("genre");

    if (searchTermFromUrl || sortFromUrl || genreFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl || "",
        sort: sortFromUrl || "desc",
        genres: genreFromUrl || "none",
      });
    }

    const fetchBooks = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/books/search?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setBooks(data.books);
      setLoading(false);
      setShowMore(data.books.length === 6);
    };

    fetchBooks();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData({ ...sidebarData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("genre", sidebarData.genres);
    navigate(`/search?${urlParams.toString()}`);
  };

  const handleShowMore = async () => {
    const startIndex = books.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const res = await fetch(`/api/books/search?${urlParams.toString()}`);
    if (!res.ok) return;

    const data = await res.json();
    setBooks([...books, ...data.books]);
    setShowMore(data.books.length === 6);
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:{" "}
            </label>
            <TextInput
              placeholder="Search ....."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Sort:</label>
            <Select id="sort" value={sidebarData.sort} onChange={handleChange}>
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">Genre:</label>
            <Select
              id="genres"
              value={sidebarData.genres}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="Fiction">Fiction</option>
              <option value="Dystopian">Dystopian</option>
              <option value="Mystery">Mystery</option>
            </Select>
          </div>
          <Button type="submit" outline gradientDuoTone="redToYellow">
            Apply Filters
          </Button>
        </form>
      </div>
      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {loading && <p>Loading...</p>}
          {!loading && books.length === 0 && <p>No books found!</p>}
          {!loading &&
            books.map((book) => <BookCard key={book._id} book={book} />)}
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
