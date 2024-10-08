/* eslint-disable react/prop-types */
import ReactMarkdown from 'react-markdown'
import StarRating from '../components/StarRating'
import '../styles/BookItem.css'

const BookItem = ({ book }) => {
    const rating = 4
    const isSeeMore = book.content.split(' ').length > 150

    const handleSeeMore = () => {
        document.getElementById('see-more-btn').style.display = 'none'
        document.getElementById('book-desc').classList.remove('text-limit')
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                <div className="col-span-1">
                    <div className="flex justify-center">
                        <div className="mx-auto">
                            <img
                                className="w-56 max-h-80 h-auto"
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
                                    <strong>Price: </strong>${book.price}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-span-2">
                    <h2 className="text-2xl text-center font-bold text-gray-800 uppercase">
                        {book.title}
                    </h2>

                    <hr className="border-t-2 my-1" />

                    <StarRating rating={rating} />

                    <div id="book-desc" className="text-base mt-2 text-limit">
                        <ReactMarkdown>{book.content}</ReactMarkdown>
                    </div>

                    {isSeeMore && (
                        <button
                            id="see-more-btn"
                            className="text-dark font-semibold px-1 rounded float-right"
                            onClick={handleSeeMore}
                        >
                            See more...
                        </button>
                    )}

                    <div className="text-center mt-2 p-3">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 m-1 rounded transition duration-200">
                            Read Book
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 m-1 rounded transition duration-200">
                            Buy Book
                        </button>
                    </div>
                </div>

                <div className="col-span-1 hidden lg:block">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4 uppercase border-b-2 border-dark inline-block pb-2">
                        Hot Books
                    </h2>

                    <ul>
                        <li className="mt-2">
                            <div className="flex items-center">
                                <div className="flex-none bg-red-500 border border-transparent rounded-full w-8 h-8 flex items-center justify-center">
                                    <p className="text-white bold">1</p>
                                </div>

                                <div className="flex-1 ml-3">
                                    <p className="text-lg">Tại hạ Cao Thăng</p>
                                    <p className="text-sm text-gray-500">Tiên hiệp, Kiếm hiệp</p>
                                </div>
                            </div>
                            <hr />
                        </li>
                        <li className="mt-2">
                            <div className="flex items-center">
                                <div className="flex-none bg-green-500 border border-transparent rounded-full w-8 h-8 flex items-center justify-center">
                                    <p className="text-white bold">2</p>
                                </div>

                                <div className="flex-1 ml-3">
                                    <p className="text-lg">Trồng cây trên Sao Hỏa</p>
                                    <p className="text-sm text-gray-500">Tiên hiệp, Sinh tồn</p>
                                </div>
                            </div>
                            <hr />
                        </li>
                        <li className="mt-2">
                            <div className="flex items-center">
                                <div className="flex-none bg-blue-500 border border-transparent rounded-full w-8 h-8 flex items-center justify-center">
                                    <p className="text-white bold">3</p>
                                </div>

                                <div className="flex-1 ml-3">
                                    <p className="text-lg">Vua tin tặc</p>
                                    <p className="text-sm text-gray-500">Phiêu lưu, Hài hước</p>
                                </div>
                            </div>
                            <hr />
                        </li>
                        <li className="mt-2">
                            <div className="flex items-center">
                                <div className="flex-none bg-white-500 border border-dark rounded-full w-8 h-8 flex items-center justify-center">
                                    <p className="text-dark bold">4</p>
                                </div>

                                <div className="flex-1 ml-3">
                                    <p className="text-lg">Ta có 7 viên đá</p>
                                    <p className="text-sm text-gray-500">Phiêu lưu, Hài hước</p>
                                </div>
                            </div>
                            <hr />
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default BookItem
