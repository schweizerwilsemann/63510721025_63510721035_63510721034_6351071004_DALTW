import React from 'react'

const Comment = () => {
    return (
        <div className="max-w-lg p-2">
            <div className="flex">
                <img
                    src="https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg"
                    alt="avt"
                    width={40}
                    className="mr-2"
                />
                <input
                    className="flex-grow p-2 border-b border-gray-300 border-transparent focus:outline-none focus:ring-0 focus:border-blue-500"
                    placeholder="Type your comment here..."
                ></input>
                <button
                    className="ml-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                    type="submit"
                >
                    Comment
                </button>
            </div>
        </div>
    )
}

export default Comment
