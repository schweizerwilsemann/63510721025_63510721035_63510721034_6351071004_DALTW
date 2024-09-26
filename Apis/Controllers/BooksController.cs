
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;

namespace Apis.Controllers;
[ApiController]
[Route("api/[controller]")]

public class BooksController : ControllerBase{
    private readonly MongoDbContext _context;

    public BooksController(MongoDbContext context){
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks () {
        var books = await _context.Books.Find(FilterDefinition<Book>.Empty).ToListAsync();
        return Ok(books);
    }

    [HttpPost]
    public async Task<IActionResult> PostBook(Book newBook)
    {
        var username = User.Identity.Name;

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
            .ToLower()
            .Replace(" ", "-")
            .Replace("[^a-zA-Z0-9-]", "");

        newBook.Slug = slug;
        newBook.Username = username;

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


}