import axios from "axios";
import React, { useState, useEffect } from "react";
import { Rating } from "react-simple-star-rating";
import { toast } from "react-toastify";

const StarRating = ({ bookInfos, userId }) => {
  const [rating, setRatingError] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);

  const handleRating = async (rate) => {
    const { id, author, title, genre, image } = bookInfos;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/starsrating`,
        { bookId: id, author, title, genre, image, userId, stars: rate },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        toast.success("Rating successfully");
        fetchBookRating();
      } else {
        toast.error(response.data.message || "An error occurred");
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred");
      }
      setRatingError(error.message);
    }
  };

  const fetchBookRating = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/starsrating/book/${
          bookInfos.id
        }`
      );
      const { averageStars, totalRatings } = response.data;
      setAverageRating(averageStars);
      setTotalRatings(totalRatings);
    } catch (error) {
      console.error("Error fetching book rating:", error);
    }
  };

  useEffect(() => {
    fetchBookRating();
  }, [bookInfos.id]);

  const onPointerEnter = () => console.log("Enter");
  const onPointerLeave = () => console.log("Leave");
  const onPointerMove = (value, index) => console.log(value, index);

  return (
    <>
      <div className="text-center mb-5 text-cyan-600 font-semibold">
        <span className="text-lg">
          Average Rating:{" "}
          {averageRating !== null ? averageRating.toFixed(1) : "N/A"} / 5{" "}
        </span>
        <p className="text-slate-500">Total Ratings: {totalRatings}</p>
      </div>

      <div className="text-sm text-center">
        <Rating
          onClick={handleRating}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          ratingValue={averageRating !== null ? averageRating : 0} // Chuyển đổi giá trị sao trung bình thành phần trăm
          precision={0.1}
        />
      </div>
    </>
  );
};

export default StarRating;
