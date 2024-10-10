
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Unidecode.NET;
using Apis.DTOs;
using MongoDB.Bson;

namespace Apis.Controllers;
[ApiController]
[Route("api/[controller]")]

public class BooksController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BooksController(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks()
    {
        var books = await _context.Books.Find(FilterDefinition<Book>.Empty).ToListAsync();
        return Ok(books);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBookBySlug(string slug)
    {
        var book = await _context.Books
                                 .Find(b => b.Slug == slug)
                                 .FirstOrDefaultAsync();

        if (book == null)
        {
            return NotFound();
        }

        return Ok(book);
    }


    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PostBook(Book newBook)
    {

        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        

        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to upload books.");
        }

        if (string.IsNullOrEmpty(newBook.Title) || string.IsNullOrEmpty(newBook.Content))
        {
            return BadRequest("Please provide all required fields!");
        }

        var existingBook = await _context.Books.Find(b => b.Title == newBook.Title).FirstOrDefaultAsync();
        if (existingBook != null)
        {
            return Conflict(new { message = "A book with this title already exists." });
        }

        var slug = newBook.Title
            .Unidecode()
            .ToLower()
            .Replace(" ", "-")
            .Replace("[^a-zA-Z0-9-]", "");

        newBook.Slug = slug;
        newBook.Username = currentUsername;
        try
        {
            Console.WriteLine("Check object: " + newBook);

            await _context.Books.InsertOneAsync(newBook);
            return CreatedAtAction(nameof(GetBooks), new { id = newBook.Id }, newBook);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    
    
    [HttpGet("search")]
    public async Task<IActionResult> SearchBooks(
        [FromQuery] string? searchTerm,
        [FromQuery] string? sort = "desc",
        [FromQuery] string? genre = null,
        [FromQuery] int startIndex = 0,
        [FromQuery] int limit = 6)
    {
        var filterBuilder = Builders<Book>.Filter;
        var filters = filterBuilder.Empty;

        if (!string.IsNullOrEmpty(searchTerm))
        {
            filters &= filterBuilder.Or(
                filterBuilder.Regex(b => b.Title, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                filterBuilder.Regex(b => b.Content, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                filterBuilder.Regex(b => b.Author, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );
        }

        if (!string.IsNullOrEmpty(genre) && genre != "none")
        {
            filters &= filterBuilder.Eq(b => b.Genre, genre);
        }

        var sortDefinition = sort == "asc"
            ? Builders<Book>.Sort.Ascending(b => b.UpdatedAt)
            : Builders<Book>.Sort.Descending(b => b.UpdatedAt);

        var books = await _context.Books
            .Find(filters)
            .Sort(sortDefinition)
            .Skip(startIndex)
            .Limit(limit)
            .ToListAsync();

        var totalBooks = await _context.Books.CountDocumentsAsync(filters);

        return Ok(new { books, totalBooks });
    }

    [HttpPut("update/{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateBook(string id, [FromBody] UpdateBookDTO updateBookDTO)
    {
         var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to update this book.");
        }
        var filter = Builders<Book>.Filter.Eq("_id", new ObjectId(id));
        var updateDefinition = new List<UpdateDefinition<Book>>();

        if (!string.IsNullOrEmpty(updateBookDTO.Title))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Title, updateBookDTO.Title));
        }

        if (!string.IsNullOrEmpty(updateBookDTO.Author))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Author, updateBookDTO.Author));
        }

        if (updateBookDTO.PublishedYear.HasValue)
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.PublishedYear, updateBookDTO.PublishedYear.Value));
        }

        if (!string.IsNullOrEmpty(updateBookDTO.Genre))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Genre, updateBookDTO.Genre));
        }

        if (updateBookDTO.Price.HasValue)
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Price, updateBookDTO.Price.Value));
        }

        if (!string.IsNullOrEmpty(updateBookDTO.Content))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Content, updateBookDTO.Content));
        }

        if (!string.IsNullOrEmpty(updateBookDTO.Username))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Username, updateBookDTO.Username));
        }

        if (!string.IsNullOrEmpty(updateBookDTO.Image))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.Image, updateBookDTO.Image));
        }

        if (!string.IsNullOrEmpty(updateBookDTO.PdfUrl))
        {
            updateDefinition.Add(Builders<Book>.Update.Set(b => b.PdfUrl, updateBookDTO.PdfUrl));
        }

        if (!updateDefinition.Any())
        {
            return BadRequest("No fields to update");
        }

        var update = Builders<Book>.Update.Combine(updateDefinition);
        var result = await _context.Books.FindOneAndUpdateAsync(filter, update, new FindOneAndUpdateOptions<Book>
        {
            ReturnDocument = ReturnDocument.After
        });

        if (result == null)
        {
            return NotFound("Book not found");
        }

        return Ok(result);
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteBook(string id)
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to delete this book.");
        }
        var filter = Builders<Book>.Filter.Eq("_id", new ObjectId(id));
        var result = await _context.Books.DeleteOneAsync(filter);

        if (result.DeletedCount == 0)
        {
            return NotFound("Book not found");
        }

        return Ok(new { message = "Book deleted successfully" });
    }


}