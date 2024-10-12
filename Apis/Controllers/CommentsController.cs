using MongoDB.Driver;
using Apis.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Unidecode.NET;
using Microsoft.AspNetCore.Mvc;
using Apis.DTOs;

namespace Apis.Controllers;
[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CommentsController (MongoDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    [HttpPost]
    public async Task<IActionResult> CreateComment([FromBody] Comment comment)
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        
        if (user == null)
        {
            return Forbid("You are not allowed to create this comment");
        }

        comment.CreatedAt = DateTime.UtcNow;
        await _context.Comment.InsertOneAsync(comment);
        return Ok(comment);
    }
    
    
    [HttpGet("book/{bookId:length(24)}")]
    public async Task<IActionResult> GetBookComments(string bookId)
    {
        var comments = await _context.Comment
            .Find(c => c.BookId == bookId)
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(comments);
    }
    
    
    [HttpPost("{commentId}/likes")]
    public async Task<IActionResult> LikeComment(string commentId)
    {
        var comment = await _context.Comment.Find(c => c.Id == commentId).FirstOrDefaultAsync();
        if (comment == null)
        {
            return NotFound("Comment not found!");
        }

        var userId = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("You need to log in to like comment");
        }

#pragma warning disable CS8604 // Possible null reference argument.
        var userIndex = Array.IndexOf(comment.Likes, userId);
#pragma warning restore CS8604 // Possible null reference argument.

        if (userIndex == -1)
        {
            comment.NumberOfLikes += 1;
            var newLikes = comment.Likes?.ToList() ?? new List<string>();
            newLikes.Add(userId);
            comment.Likes = newLikes.ToArray();
        }
        else
        {
            comment.NumberOfLikes -= 1;
            var updatedLikes = comment.Likes?.ToList() ?? new List<string>();
            updatedLikes.Remove(userId);
            comment.Likes = updatedLikes.ToArray();
        }

        await _context.Comment.ReplaceOneAsync(c => c.Id == commentId, comment);
        return Ok(comment);
    }

    [HttpPut("{commentId}")]
    public async Task<IActionResult> EditComment(string commentId, [FromBody] UpdateCommentDTO editCommentDto)
    {
        var comment = await _context.Comment.Find(c => c.Id == commentId).FirstOrDefaultAsync();
        if (comment == null)
        {
            return NotFound("Comment not found!");
        }

        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user == null)
        {
            return Forbid("You do not have permission to edit the comment.");
        }

        comment.Content = editCommentDto.Content ?? comment.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.Comment.ReplaceOneAsync(c => c.Id == commentId, comment);
        return Ok(comment);
    }
    [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(string commentId)
        {
            var comment = await _context.Comment.Find(c => c.Id == commentId).FirstOrDefaultAsync();
            if (comment == null)
            {
                return NotFound("Comment not found!");
            }

            var userId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";

            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();

            if (comment.UserId != userId && !user.IsAdmin)
            {
                return Forbid("You are not allowed to delete this comment");
            }

            await _context.Comment.DeleteOneAsync(c => c.Id == commentId);
            return Ok("Comment has been deleted");
        }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetComments([FromQuery] int startIndex = 0, [FromQuery] int limit = 10, [FromQuery] string? sort = "asc")
    {
        var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
        
        var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
        

        if (user.IsAdmin && user == null)
        {
            return Forbid("You do not have permission to get all the books were sold.");
        }
        var sortDirection = sort == "desc" ? -1 : 1;
        var comments = await _context.Comment
                .Find(_ => true)
                .Sort(sortDirection == 1 ? Builders<Comment>.Sort.Ascending(c => c.CreatedAt) : Builders<Comment>.Sort.Descending(c => c.CreatedAt))
                .Skip(startIndex)
                .Limit(limit)
                .ToListAsync();

        var totalComments = await _context.Comment.CountDocumentsAsync(_ => true);
        var now = DateTime.UtcNow;
        var oneMonthAgo = now.AddMonths(-1);
        var lastMonthComments = await _context.Comment.CountDocumentsAsync(c => c.CreatedAt >= oneMonthAgo);

        return Ok(new { comments, totalComments, lastMonthComments });
    }
}