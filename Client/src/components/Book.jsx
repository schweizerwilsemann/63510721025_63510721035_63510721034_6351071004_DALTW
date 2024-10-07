import React from 'react'
// import '../styles/Book.css'
import { Link } from 'react-router-dom'

export const Book = ({ book }) => {
  return (
    <div className="text-center cursor-pointer select-none">
      <Link to={`/books/${book.slug}`}>
        <img
          className="w-full h-56 sm:h-52 md:h-52 lg:h-56 xl:h-56 object-cover"
          src={book.image}
          alt={`${book.title}-image`}
        />
        <div className="text-center bg-black text-white bg-opacity-60 p-1">
          <h3
            title={`${book.title}`}
            className="truncate whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {book.title}
          </h3>
        </div>
      </Link>
    </div>
  )
}
