using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Apis.Models;
using MongoDB.Driver;
using MongoDB.Bson;  // Ensure this namespace includes MongoDbContext, Book, User

var builder = WebApplication.CreateBuilder(args);

// Add MongoDB configuration
var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb") 
                            ?? throw new InvalidOperationException("MongoDb connection string not found.");

var databaseName = "Library";

builder.Services.AddSingleton(new MongoDbContext(mongoConnectionString, databaseName));

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

var app = builder.Build();

// Check MongoDB connection
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    try
    {
        // Perform a simple operation to check connection
        await context.Database.RunCommandAsync((Command<BsonDocument>)"{ping:1}");
        Console.WriteLine("MongoDB connected successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"MongoDB connection failed: {ex.Message}");
    }
}

// Insert sample data if the collections are empty
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

    if (!await context.Books.Find(FilterDefinition<Book>.Empty).AnyAsync())
    {
        var sampleBooks = new List<Book>
        {
            new() {
                Title = "Sample Book 1",
                Author = "Author 1",
                PublishedYear = 2021,
                Genre = "Fiction",
                Price = 10.99m
            },
            new()
            {
                Title = "Sample Book 2",
                Author = "Author 2",
                PublishedYear = 2020,
                Genre = "Non-Fiction",
                Price = 15.99m
            }
        };
        await context.Books.InsertManyAsync(sampleBooks);
        Console.WriteLine("Sample books inserted.");
    }

    if (!await context.Users.Find(FilterDefinition<User>.Empty).AnyAsync())
    {
        var sampleUsers = new List<User>
        {
            new () {
                Username = "User1",
                Email = "user1@example.com",
                PasswordHash = "password1hash",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            },
            new ()
            {
                Username = "User2",
                Email = "user2@example.com",
                PasswordHash = "password2hash",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            }
        };
        await context.Users.InsertManyAsync(sampleUsers);
        Console.WriteLine("Sample users inserted.");
    }
}

// Define endpoints
app.MapGet("/", () => "Hello World!");

app.MapGet("/api/books", async (MongoDbContext context) =>
{
    var books = await context.Books.Find(FilterDefinition<Book>.Empty).ToListAsync();
    return Results.Ok(books);
});

app.MapGet("/api/users", async (MongoDbContext context) =>
{
    var users = await context.Users.Find(FilterDefinition<User>.Empty).ToListAsync();
    return Results.Ok(users);
});

app.Run();
