using MongoDB.Driver;
using Apis.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Unidecode.NET;
using Microsoft.AspNetCore.Mvc;
using Apis.DTOs;


[ApiController]
[Route("api/[controller]")]
public class StarsRatingController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public StarsRatingController (MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    [HttpPost]
   public async Task<IActionResult> CreateRating([FromBody] StarsRating rating)
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";

        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        
        if (user == null)
        {
            return Forbid("You need to log in to rate the books.");
        }
        if (rating == null)
        {
            return BadRequest(new { message = "Rating is null." });
        }

        var existingRating = await _context.StarsRatings
            .Find(r => r.BookId == rating.BookId && r.UserId == user.Id)
            .FirstOrDefaultAsync();

        if (existingRating != null)
        {
            return BadRequest(new { message = "You have already rated this book." });
        }

        rating.UserId = user.Id ?? "";
        await _context.StarsRatings.InsertOneAsync(rating);
        return CreatedAtAction(nameof(GetRatingById), new { id = rating.Id }, rating);
    }



        [HttpGet("{id:length(24)}", Name = "GetRatingById")]
        public async Task<IActionResult> GetRatingById(string id)
        {
             var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return Forbid("You are not allowed to get this rating");
            }
            var rating = await _context.StarsRatings.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (rating == null)
            {
                return NotFound();
            }
            return Ok(rating);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> UpdateRating(string id, [FromBody] StarsRating updatedRating)
        {
             var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return Forbid("You are not allowed to update this rating");
            }
            if (updatedRating == null || updatedRating.Id != id)
            {
                return BadRequest("Rating is null or ID mismatch.");
            }

            var rating = await _context.StarsRatings.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (rating == null)
            {
                return NotFound();
            }

            await _context.StarsRatings.ReplaceOneAsync(r => r.Id == id, updatedRating);
            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> DeleteRating(string id)
        {
            var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            
            if (user == null)
            {
                return Forbid("You are not allowed to delete this rating");
            }
            var rating = await _context.StarsRatings.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (rating == null)
            {
                return NotFound();
            }

            await _context.StarsRatings.DeleteOneAsync(r => r.Id == id);
            return NoContent();
        }

        [HttpGet("hot-books")]
        public async Task<IActionResult> GetHotBooks()
        {
            var hotBooks = await _context.StarsRatings.Aggregate()
                .Group(r => r.BookId, g => new BookRatingSummary
                {
                    BookId = g.Key,
                    AverageStars = g.Average(r => r.Stars),
                    OneStar = g.Count(r => r.Stars == 1),
                    TwoStars = g.Count(r => r.Stars == 2),
                    ThreeStars = g.Count(r => r.Stars == 3),
                    FourStars = g.Count(r => r.Stars == 4),
                    FiveStars = g.Count(r => r.Stars == 5)
                })
                .SortByDescending(g => g.AverageStars)
                .Limit(10)
                .ToListAsync();

            var hotBooksWithDetails = hotBooks.Select(h => new
            {
                h.BookId,
                h.AverageStars,
                h.OneStar,
                h.TwoStars,
                h.ThreeStars,
                h.FourStars,
                h.FiveStars,
                BookDetails = _context.Books.Find(b => b.Id == h.BookId).FirstOrDefault()
            }).ToList();

            return Ok(hotBooksWithDetails);
        }
        
        [HttpGet("book/{bookId:length(24)}")]
        public async Task<IActionResult> GetBookRating(string bookId)
        {
            var bookRating = await _context.StarsRatings.Aggregate()
                .Match(r => r.BookId == bookId) // Lọc theo BookId
                .Group(r => r.BookId, g => new
                {
                    BookId = g.Key,
                    AverageStars = g.Average(r => r.Stars), // Tính số sao trung bình
                    TotalRatings = g.Count() // Đếm tổng số lượng đánh giá
                })
                .FirstOrDefaultAsync(); // Lấy kết quả đầu tiên hoặc null nếu không có đánh giá

            if (bookRating == null)
            {
                return NotFound(new { Message = "No ratings found for this book." });
            }

            return Ok(bookRating);
        }

    }

