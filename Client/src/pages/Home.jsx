    import React, { useEffect, useState } from 'react'

      const Home = () => {
      const [books, setBooks] = useState([])
      const [loading, setLoading] = useState(true)

      const fetchData = async () => {
        const respose = await fetch("http://localhost:5173/api/books")
        const result = await respose.json() 
        
        setBooks(result)
      }

      useEffect(() => {
        fetchData()
        setTimeout(() => {
          
          setLoading(false)
        }, 3000);
      }, [])

      if(loading) return <div>Loading...</div>

      return (<div>
        {books.map((book) => {
          return <div key={book.id}><h3>{book.title}</h3> <p>{book.author}</p></div>
        })}

      </div>)
    }

    export default Home
