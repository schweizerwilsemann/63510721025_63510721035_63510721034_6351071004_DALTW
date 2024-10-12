
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
    
    [HttpGet("user/books-in-progress")]
    public async Task<IActionResult> GetBooksInProgress()
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();

        if (user == null)
        {
            return Forbid("You do not have permission to get books.");
        }

        var filter = Builders<BookSold>.Filter.And(
            Builders<BookSold>.Filter.Eq(bs => bs.Username, currentUsername),
            Builders<BookSold>.Filter.Or(
                Builders<BookSold>.Filter.Eq(bs => bs.Status, "Pending"),
                Builders<BookSold>.Filter.Eq(bs => bs.Status, "Approved")
            )
        );

        var booksInProgress = await _context.BookSold.Find(filter).ToListAsync();

        return Ok(booksInProgress);
    }

    [HttpGet("user/bought-books")]
    public async Task<IActionResult> GetBoughtBooks()
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();

        if (user == null)
        {
            return Forbid("You do not have permission to get books.");
        }

        var filter = Builders<BookSold>.Filter.And(
            Builders<BookSold>.Filter.Eq(bs => bs.Username, currentUsername),
            Builders<BookSold>.Filter.Or(
                Builders<BookSold>.Filter.Eq(bs => bs.Status, "Approved")
            )
        );

        var boughtBooks = await _context.BookSold.Find(filter).ToListAsync();

        return Ok(boughtBooks);
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

    [HttpGet("{bookId:length(24)}", Name = "GetBookSoldById")]
    public async Task<IActionResult> GetBookSoldById(string bookId)
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";

        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();

        if (user == null)
        {
            return Forbid("You do not have permission to access this book.");
        }
        var book = await _context.Books.Find(b => b.Id == bookId).FirstOrDefaultAsync();
        if (book == null)
        {
            return NotFound("Book not found.");
        }

        var filter = Builders<BookSold>.Filter.And(
            Builders<BookSold>.Filter.Eq(book => book.BookId, bookId),
            Builders<BookSold>.Filter.Eq(book => book.Username, currentUsername)
        );

        var bookSold = await _context.BookSold.Find(filter)
        .Sort(Builders<BookSold>.Sort.Descending(book => book.UpdatedAt))
        .FirstOrDefaultAsync();

        if (bookSold == null)
        {
            return NotFound("Book not found or you do not have permission to access it.");
        }

        return Ok(bookSold);
    }

    [HttpPost]
    [Authorize]
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
            // Gán UserId từ người dùng hiện tại và trạng thái là "Pending"
            newBookSold.UserId = user.Id;
            newBookSold.Status = "Pending"; // Đặt trạng thái là Pending để admin duyệt

            // Ghi vào cơ sở dữ liệu
            await _context.BookSold.InsertOneAsync(newBookSold);

            // Trả về thông báo thành công
            return Ok("Your request has been submitted and is pending admin approval.");
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
            return Forbid("You do not have permission to reject this book.");
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