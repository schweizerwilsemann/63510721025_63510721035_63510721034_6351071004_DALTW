const StarRating = ({ rating }) => {
  const filledStars = Array.from({ length: rating }, (_, i) => (
    <span key={i} className="text-yellow-500">
      ★
    </span>
  ))

  const emptyStars = Array.from({ length: 5 - rating }, (_, i) => (
    <span key={i + rating} className="text-black">
      ★
    </span>
  ))

  return (
    <>
      <div className="flex justify-center text-center text-xl">
        {filledStars}
        {emptyStars}
      </div>
      <p className="text-sm text-center">
        Rating: <strong>{rating}</strong>/5 from <strong>2 votes</strong>
      </p>
    </>
  )
}

export default StarRating
