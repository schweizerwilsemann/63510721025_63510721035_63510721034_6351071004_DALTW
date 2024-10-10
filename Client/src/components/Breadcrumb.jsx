import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'

const Breadcrumb = ({ book, chapter = null }) => {
  return (
    <nav className="flex my-2 text-gray-700" aria-label="Breadcrumb">
      <ol className="inline-flex items-center md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            className="flex items-center text-dark-600 hover:underline"
            to="/"
          >
            <FaHome size={20} className="" />
            <span className="pl-1">Home</span>
          </Link>
        </li>

        <li>/</li>

        <li>
          <div className="flex items-center">
            <Link
              to={`/books/${book.slug}`}
              className="text-dark-600 hover:underline"
            >
              {book.title}
            </Link>
          </div>
        </li>

        {chapter && (
          <>
            <li>/</li>
            <li aria-current="page">
              <div className="flex items-center">
                <Link to="/" className="text-dark-600 hover:underline">
                  {chapter}
                </Link>
              </div>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}

export default Breadcrumb
