
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Unidecode.NET;

namespace Apis.Controllers;
[ApiController]
[Route("api/[controller]")]

public class BookSoldController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public BookSoldController(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    [HttpGet]
    public async Task<IActionResult> GetBooksSold()
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to get all the books were sold.");
        }
        var booksSold = await _context.BookSold.Find(FilterDefinition<BookSold>.Empty).ToListAsync();
        return Ok(booksSold);
    }
    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingBooksSold()
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to get pending books.");
        }

        var filter = Builders<BookSold>.Filter.Eq(bs => bs.Status, "Pending");
        var pendingBooksSold = await _context.BookSold.Find(filter).ToListAsync();

        return Ok(pendingBooksSold);
    }

    [HttpGet("{id:length(24)}", Name = "GetBookSoldById")]
    public async Task<IActionResult> GetBookSoldById(string id)
        {
        var bookSold = await _context.BookSold.Find<BookSold>(book => book.Id == id).FirstOrDefaultAsync();
        if (bookSold == null)
        {
            return NotFound();
        }

        return Ok(bookSold);
    }
    [HttpPost]
    public async Task<IActionResult> CreateBookSold(BookSold newBookSold)
    {
        if (newBookSold == null)
        {
            return BadRequest("BookSold object is null");
        }

        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";

        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();

        if (user == null)
        {
            return Forbid("User not found.");
        }

        var existingBookSold = await _context.BookSold.Find<BookSold>
                                    (book => book.UserId == user.Id && book.BookId == newBookSold.BookId 
                                        && book.Status == "Approved").FirstOrDefaultAsync();
        var pendingBook = await _context.BookSold.Find<BookSold>
                                    (book => book.UserId == user.Id && book.BookId == newBookSold.BookId 
                                        && book.Status == "Pending").FirstOrDefaultAsync();                               
        if (pendingBook != null)
        {
            return BadRequest("You have already requested to buy this book! Please wait for admin to approve your request.");
        }
        if (existingBookSold != null)
        {
            return BadRequest("You have already bought this book and it is approved.");
        }

        try
        {
            newBookSold.UserId = user.Id; // Giả sử bạn có trường UserId trong model BookSold
            await _context.BookSold.InsertOneAsync(newBookSold);
            return CreatedAtAction(nameof(GetBookSoldById), new { id = newBookSold.Id }, newBookSold);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id:length(24)}/approve")]
    [Authorize]
    public async Task<IActionResult> ApproveBookSold(string id)
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to upload books.");
        }
        var filter = Builders<BookSold>.Filter.Eq(bs => bs.Id, id);
        var update = Builders<BookSold>.Update.Set(bs => bs.Status, "Approved");

        var result = await _context.BookSold.UpdateOneAsync(filter, update);

        if (result.ModifiedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
    [HttpPut("{id:length(24)}/reject")]
    [Authorize]
    public async Task<IActionResult> RejectBookSold(string id)
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null || !user.IsAdmin)
        {
            return Forbid("You do not have permission to upload books.");
        }
        var filter = Builders<BookSold>.Filter.Eq(bs => bs.Id, id);
        var update = Builders<BookSold>.Update.Set(bs => bs.Status, "Rejected");

        var result = await _context.BookSold.UpdateOneAsync(filter, update);

        if (result.ModifiedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }

}