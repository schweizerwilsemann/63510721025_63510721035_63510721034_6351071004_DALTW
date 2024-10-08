import React from "react";
import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  return (
    <div
      className="group relative w-full border h-[420px] 
                 overflow-hidden rounded-lg sm:w-[350px] 
                 border-orange-600 hover:border-2 transition-all"
    >
      <Link to={`/books/${book.slug}`}>
        <img
          src={book.image}
          alt={book.title}
          className="h-[300px] w-full object-cover group-hover:h-[260px] 
                     transition-all duration-300 z-20"
        />
      </Link>
      <div className="p-3 flex flex-col gap-2">
        <p className="text-lg font-semibold line-clamp-2">{book.title}</p>
        <span className="italic text-sm">{book.genre}</span>
        <Link
          to={`/books/${book.slug}`}
          className="z-10 absolute bottom-[-200px] left-0 right-0 
                     border border-orange-400 text-orange-400 hover:bg-orange-400 
                     hover:text-white transition-all duration-300 text-center 
                     py-2 rounded-md !rounded-tl-none m-2 group-hover:bottom-0"
        >
          Read Book
        </Link>
      </div>
    </div>
  );
}
