using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace Apis.Models;
public class Comment
{
    [BsonId]  // Indicates that this is the primary key (_id in MongoDB)
    [BsonRepresentation(BsonType.ObjectId)]  // Converts ObjectId to string for easier handling
    public string? Id { get; set; }

    [BsonElement("username")]
    public required string Username { get; set; }

    [BsonElement("postId")]
    public required string PostId { get; set; }

    [BsonElement("likes")]
    public Array ?Like { get; set; }

    [BsonElement("number_of_likes")]
    public int NumberOfLikes { get; set; } = 0;

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
}
