using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Apis.Models
{
    public class BookSold{
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        [BsonElement("book_id")]
        public string? BookId { get; set;}
        [BsonElement("title")]
        public string? Title { get; set;}
        [BsonElement("price")]
        public decimal Price { get; set;}
        [BsonElement("user_id")]
        public string? UserId { get; set;}
        [BsonElement("username")]
        public string? Username { get; set;}
        [BsonElement("email")]
        public string? Email { get; set;}
        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // Default status is Pending
        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        [BsonElement("image")]
        public string ?Image { get; set; }
        [BsonElement("genre")]
        public string ?Genre { get; set; }
        [BsonElement("slug")]
        public string ?Slug { get; set; }
    }
}