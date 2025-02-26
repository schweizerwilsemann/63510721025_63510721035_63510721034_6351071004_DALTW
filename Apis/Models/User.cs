using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections;

namespace Apis.Models;
public class User
{
    [BsonId]  // Indicates that this is the primary key (_id in MongoDB)
    [BsonRepresentation(BsonType.ObjectId)]  // Converts ObjectId to string for easier handling
    public string? Id { get; set; }

    [BsonElement("username")]  // Maps the property to the "username" field in MongoDB.
    public required string Username { get; set; }

    [BsonElement("email")]
    public required string Email { get; set; }

    [BsonElement("password_hash")]
    public required string PasswordHash { get; set; }

    [BsonElement("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("is_active")]
    public bool IsActive { get; set; }

    [BsonElement("is_admin")]
    public bool IsAdmin { get; set; }=false;
    
    [BsonElement("photoURL")]
    public string ?PhotoURL { get; set; } = "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small_2x/user-profile-icon-free-vector.jpg";
}
