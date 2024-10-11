import React from "react";
import { Link } from "react-router-dom";

export const Book = ({ book }) => {
  return (
    <div className="text-center cursor-pointer select-none">
      <Link to={`/books/${book.slug}`}>
        <img
          className="w-full h-72 sm:h-64 md:h-64 lg:h-72 xl:h-72 object-cover"
          src={book.image}
          alt={`${book.title}-image`}
        />
        <div className="text-center bg-black text-white bg-opacity-60 p-2">
          <h3
            title={`${book.title}`}
            className="truncate whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {book.title}
          </h3>
        </div>
      </Link>
    </div>
  );
};
