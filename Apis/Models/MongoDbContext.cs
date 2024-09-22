using MongoDB.Driver;

namespace Apis.Models;
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<Book> Books => _database.GetCollection<Book>("Books");
    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");

    public IMongoDatabase Database => _database;

    public async Task<bool> UserExistsAsync(string username, string email)
    {
        var filter = Builders<User>.Filter.Or(
            Builders<User>.Filter.Eq(u => u.Username, username),
            Builders<User>.Filter.Eq(u => u.Email, email)
        );
        return await Users.Find(filter).AnyAsync();
    }

}