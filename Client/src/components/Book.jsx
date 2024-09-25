import React from 'react'
// import '../styles/Book.css'

export const Book = ({ book }) => {
  return (
    <div className="text-center cursor-pointer select-none">
      <img
        className="w-full h-56 sm:h-56 md:h-60 lg:h-64 xl:h-64 object-cover"
        src={book.image}
        alt={`${book.title}-image`}
      />

      <div className="text-center bg-black text-white bg-opacity-60">
        <h3>{book.title}</h3>
      </div>
    </div>
  )
}
