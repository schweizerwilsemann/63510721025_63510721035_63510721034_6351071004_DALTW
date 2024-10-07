import React from 'react'
import ReactMarkdown from 'react-markdown'
import StarRating from '../components/StarRating'

const BookItem = ({ book }) => {
  const rating = 4
  const markdown = `
  This is a simple example of **Markdown** in React.
  # Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
  `

  return (
    <div className="flex">
      <div className="w-1/5 p-2">
        <img
          className="w-full max-h-80 h-auto"
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
            <strong>Price: </strong> {book.price}
          </p>
        </div>
      </div>

      <div className="w-4/5 p-2">
        <h2 className="text-2xl text-center font-bold text-gray-800 uppercase">
          {book.title}
        </h2>

        <hr className="border-t-2 border-gray-300 my-1" />

        <StarRating rating={rating} />

        <div className="text-base mt-2">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>

        <div className="text-center p-3">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 m-1 rounded transition duration-200">
            Read Book
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 m-1 rounded transition duration-200">
            Buy Book
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookItem
