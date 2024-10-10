using System.Runtime.InteropServices.Marshalling;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Apis.Models
{
    public class Book
    {
        [BsonId]  // Indicates that this is the primary key (_id in MongoDB)
        [BsonRepresentation(BsonType.ObjectId)]  // Converts ObjectId to string for easier handling
        public string? Id { get; set; }

        [BsonElement("title")]  // Maps the property to the "title" field in MongoDB
        public required string Title { get; set; }

        [BsonElement("author")]
        public required string Author { get; set; }

        [BsonElement("published_year")]
        public int PublishedYear { get; set; }


        [BsonElement("genre")]
        public required string Genre { get; set; }

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("content")]
        public required string Content { get; set; }
        
        [BsonElement("username")]
        public required string Username { get; set; }

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("slug")]
        public string? Slug { get; set; }
        
        [BsonElement("image")]
        public string? Image { get; set; }
        [BsonElement("pdfUrl")]
        public string? PdfUrl { get; set; }
    }
}
