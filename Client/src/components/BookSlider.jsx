<<<<<<< HEAD
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./styles.css";

import { Pagination, Navigation } from "swiper/modules";

import { Book } from "../components/Book";
=======
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css' // Import Swiper styles
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import { Pagination, Navigation } from 'swiper/modules'

import { Book } from '../components/Book'
>>>>>>> f41dec57fd4557cb40a1aed37f31f6ab62d009a3

export const BookSlider = ({ books }) => {
  return (
    <Swiper
      breakpoints={{
        // When window width is >= 320px
        320: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 10,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 6,
          spaceBetween: 20,
        },
      }}
      pagination={{
        clickable: true,
      }}
<<<<<<< HEAD
      loop={true}
      modules={[Navigation]}
      navigation={true}
=======
      modules={[Navigation]}
>>>>>>> f41dec57fd4557cb40a1aed37f31f6ab62d009a3
    >
      {books.map((book) => (
        <SwiperSlide key={book.id}>
          <Book book={book} />
        </SwiperSlide>
      ))}
    </Swiper>
<<<<<<< HEAD
  );
};
=======
  )
}
>>>>>>> f41dec57fd4557cb40a1aed37f31f6ab62d009a3
