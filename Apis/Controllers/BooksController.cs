
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Unidecode.NET;

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
                filterBuilder.Regex(b => b.Content, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
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
}