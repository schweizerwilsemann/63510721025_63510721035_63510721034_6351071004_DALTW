import React, { useEffect, useState } from 'react'

import { BookSlider } from '../components/BookSlider'
import { Banner } from '../components/Banner'

const Home = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const response = await fetch('http://localhost:5173/api/books')
    const result = await response.json()

    setBooks(result)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading)
    return (
      <div className="container mx-auto">
        <div>Loading...</div>
      </div>
    )

  const settings = {
    dots: false,
    infinite: true, // Loop through slides
    speed: 500, // Slide transition speed in milliseconds
    slidesToShow: 6, // Number of slides to show at a time
    slidesToScroll: 1, // Number of slides to scroll at a time
  }

  return (
    <div className="container mx-auto">
      <Banner />

      <div className="hot mx-4">
        <h2 className="font-bold my-6 text-xl uppercase">Truyện Hot 🔥</h2>
        <BookSlider books={books} />
      </div>
      <div className="new mx-4">
        <h2 className="font-bold my-6 text-xl uppercase">Truyện Mới 💦</h2>
        <BookSlider books={books} />
      </div>
    </div>
  )
}

export default Home
