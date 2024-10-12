using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections;

namespace Apis.Models;
public class StarsRating
{
    [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("bookId")]
        public required string BookId { get; set; }
        [BsonElement("title")]  // Maps the property to the "title" field in MongoDB
        public required string Title { get; set; }

        [BsonElement("author")]
        public required string Author { get; set; }

        [BsonElement("userId")]
        public required string UserId { get; set; }
        [BsonElement("genre")]
        public required string Genre { get; set; }

        [BsonElement("stars")]
        public int Stars { get; set; }
        [BsonElement("image")]
        public string? Image { get; set; }
        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; }

}
public class BookRatingSummary
{
    public required string BookId { get; set; }
    public double AverageStars { get; set; }
    public int OneStar { get; set; }
    public int TwoStars { get; set; }
    public int ThreeStars { get; set; }
    public int FourStars { get; set; }
    public int FiveStars { get; set; }
}