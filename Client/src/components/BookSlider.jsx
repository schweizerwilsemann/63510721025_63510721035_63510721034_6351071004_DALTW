import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./styles.css";

import { Pagination, Navigation, Autoplay } from "swiper/modules"; // Import Autoplay module

import { Book } from "../components/Book";

export const BookSlider = ({ books }) => {
  return (
    <Swiper
      breakpoints={{
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
      loop={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      modules={[Navigation, Autoplay]}
      navigation={true}
    >
      {books.map((book) => (
        <SwiperSlide key={book.id}>
          <Book book={book} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
