using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace Apis.Models;
public class Comment
{
    [BsonId]  // Indicates that this is the primary key (_id in MongoDB)
    [BsonRepresentation(BsonType.ObjectId)]  // Converts ObjectId to string for easier handling
    public string? Id { get; set; }
    [BsonElement("content")]
    public required string Content { get; set; }
    [BsonElement("userId")]
    public required string UserId { get; set; }

    [BsonElement("bookId")]
    public required string BookId { get; set; }

    [BsonElement("likes")]
    public string[] ?Likes { get; set; } = Array.Empty<string>();

    [BsonElement("number_of_likes")]
    public int NumberOfLikes { get; set; } = 0;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
}
