using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections;

namespace Apis.Models;
public class StarsRating
{
    [BsonId]  // Indicates that this is the primary key (_id in MongoDB)
    [BsonRepresentation(BsonType.ObjectId)]  // Converts ObjectId to string for easier handling
    public string? Id { get; set; }

    [BsonElement("username")]  // Maps the property to the "username" field in MongoDB.
    public required string Username { get; set; }

    [BsonElement("slug")]
    public string? Slug { get; set; }
        
    [BsonElement("image")]
    public string? Image { get; set; }
    
    [BsonElement("genre")]
    public required string Genre { get; set; }
    [BsonElement("title")] 
    public required string Title { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("is_active")]
    public bool IsActive { get; set; }

}