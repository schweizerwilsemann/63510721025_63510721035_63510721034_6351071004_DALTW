import React from 'react'
import { BsFacebook, BsTwitter, BsInstagram, BsLinkedin } from 'react-icons/bs'

const JoinUs = () => {
  return (
    <div className="w-full h-min">
      <div className="bg-[url('https://img.freepik.com/free-photo/futuristic-metaverse-empty-room-product-display-presentation-abstract-technology-scifi-with-neon-light-3d-background_56104-2314.jpg')] bg-cover bg-center p-6 text-white">
        <h2 className="font-bold my-2 text-xl uppercase text-center">
          join us
        </h2>

        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vel
          similique molestias, architecto rerum, dolorem in quaerat eaque
          nesciunt repellendus eos atque quasi unde accusantium optio
          reprehenderit sapiente cupiditate voluptas error.
        </p>

        <div className="flex space-x-4 justify-center items-center py-6">
          <button class="bg-blue-500 uppercase text-white py-2 px-4">
            join us
          </button>

          {/* Facebook */}
          <a
            href="https://www.facebook.com"
            className="text-blue-600 hover:text-blue-800 text-3xl"
          >
            <BsFacebook />
          </a>

          {/* Twitter */}
          <a
            href="https://www.twitter.com"
            className="text-blue-400 hover:text-blue-600 text-3xl"
          >
            <BsTwitter />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com"
            className="text-pink-500 hover:text-pink-700 text-3xl"
          >
            <BsInstagram />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com"
            className="text-blue-700 hover:text-blue-900 text-3xl"
          >
            <BsLinkedin />
          </a>
        </div>
      </div>
    </div>
  )
}

export default JoinUs
