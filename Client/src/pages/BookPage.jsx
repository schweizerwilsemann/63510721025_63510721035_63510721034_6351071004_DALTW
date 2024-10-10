import { Button, Spinner } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BookCard from '../components/BookCard'

export default function BookPage() {
  const { bookSlug } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [book, setBook] = useState(null)
  const [recentBooks, setRecentBooks] = useState(null)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/books/search?slug=${bookSlug}`)
        const data = await res.json()
        if (!res.ok) {
          setError(true)
          setLoading(false)
          return
        }
        if (res.ok) {
          setBook(data.books[0])
          setLoading(false)
          setError(false)
        }
      } catch (error) {
        setError(true)
        setLoading(false)
      }
    }
    fetchBook()
  }, [bookSlug])

  useEffect(() => {
    try {
      const fetchRecentBooks = async () => {
        const res = await fetch(`/api/books/search?limit=3`)
        const data = await res.json()
        if (res.ok) {
          setRecentBooks(data.books)
        }
      }
      fetchRecentBooks()
    } catch (error) {
      console.log(error.messaage)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl">loading . . .</Spinner>
      </div>
    )
  }

  return (
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {book && book.title}
      </h1>
      <Link
        to={`/search?category=${book && book.category}`}
        className="self-center mt-5 "
      >
        <Button color="gray" pill size="xs" className="">
          {book && book.category}
        </Button>
      </Link>
      <img
        src={book && book.image}
        alt={book && book.title}
        className="mt-10 p-3 max-h-[600px] w-full object-cover"
      />
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs ">
        <span>{book && new Date(book.createdAt).toLocaleDateString()}</span>
        <span className="italic">
          {' '}
          {book && (book.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: book && book.content }}
        className="p-3 max-w-2xl mx-auto w-full post-content"
      ></div>

      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent Articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentBooks &&
            recentBooks.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </div>
    </main>
  )
}
