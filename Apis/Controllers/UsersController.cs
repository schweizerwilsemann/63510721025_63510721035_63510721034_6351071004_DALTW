using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;

namespace Apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UsersController(MongoDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
            if (currentUsername == null)
            {
                Console.WriteLine(">>> currentUsername is null");
            }
            else
            {
                Console.WriteLine(">>> check current user: " + currentUsername);
            }

            var claims = _httpContextAccessor.HttpContext?.User.Claims ?? [];
            foreach (var claim in claims)
            {
                Console.WriteLine($"Claim Type: {claim.Type}, Claim Value: {claim.Value}");
            }

            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            Console.WriteLine(">>> check user: " + user?.Username);

            if (user == null || !user.IsAdmin)
            {
                return Forbid("You do not have permission to get users!");
            }

            var users = await _context.Users.Find(FilterDefinition<User>.Empty).ToListAsync();
            return Ok(users);
        }

        [HttpGet("statistic")]
        [Authorize]
        public async Task<IActionResult> GetUsers(string sort = "asc", int startIndex = 0, int limit = 10)
        {
            var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
            
            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            
            if (user == null || !user.IsAdmin)
            {
                return Forbid("You do not have permission to view the list of users.");
            }

            var sortDirection = sort == "desc" ? -1 : 1;

            var users = await _context.Users
                .Find(_ => true) 
                .Sort(sortDirection == 1 ? Builders<User>.Sort.Ascending(u => u.CreatedAt) : Builders<User>.Sort.Descending(u => u.CreatedAt))
                .Skip(startIndex) 
                .Limit(limit) 
                .ToListAsync();

            
            var totalUsers = await _context.Users.CountDocumentsAsync(_ => true);

            var now = DateTime.UtcNow;
            var oneMonthAgo = now.AddMonths(-1);
            var lastMonthUsers = await _context.Users.CountDocumentsAsync(u => u.CreatedAt >= oneMonthAgo);

            return Ok(new
            {
                totalUsers,
                lastMonthUsers,
                users
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);

            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserByUsername(string id)
        {
            var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound( new {message = "User not found"});
            }

            return Ok(user);
        }
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updatedUser)
        {
            var filter = Builders<User>.Filter.Eq("_id", new ObjectId(id));
            var updateDefinition = new List<UpdateDefinition<User>>();

            if (!string.IsNullOrEmpty(updatedUser.Email))
            {
                // Check if the email already exists in the database
                var emailExists = await _context.Users.Find(Builders<User>.Filter.Eq(u => u.Email, updatedUser.Email)).AnyAsync();
                if (emailExists)
                {
                    return Conflict("Email already exists");
                }
                updateDefinition.Add(Builders<User>.Update.Set(u => u.Email, updatedUser.Email));
            }

            if (!string.IsNullOrEmpty(updatedUser.PasswordHash))
            {
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(updatedUser.PasswordHash);
                updateDefinition.Add(Builders<User>.Update.Set(u => u.PasswordHash, hashedPassword));
            }

            if (!string.IsNullOrEmpty(updatedUser.PhotoURL))
            {
                updateDefinition.Add(Builders<User>.Update.Set(u => u.PhotoURL, updatedUser.PhotoURL));
            }

            if (!string.IsNullOrEmpty(updatedUser.Username))
            {
                // Check if the username already exists in the database
                var usernameExists = await _context.Users.Find(Builders<User>.Filter.Eq(u => u.Username, updatedUser.Username)).AnyAsync();
                if (usernameExists)
                {
                    return Conflict("Username already exists");
                }
                updateDefinition.Add(Builders<User>.Update.Set(u => u.Username, updatedUser.Username));
            }

            if (!updateDefinition.Any())
            {
                return BadRequest("No fields to update");
            }

            var update = Builders<User>.Update.Combine(updateDefinition);
            var result = await _context.Users.FindOneAndUpdateAsync(filter, update, new FindOneAndUpdateOptions<User>
            {
                ReturnDocument = ReturnDocument.After
            });

            if (result == null)
            {
                return NotFound("User not found");
            }

            // Update username and email in BookSold collection
            var bookSoldFilter = Builders<BookSold>.Filter.Eq("user_id", id);
            var bookSoldUpdates = new List<UpdateDefinition<BookSold>>();

            if (!string.IsNullOrEmpty(updatedUser.Email))
            {
                bookSoldUpdates.Add(Builders<BookSold>.Update.Set(b => b.Email, updatedUser.Email));
            }

            if (!string.IsNullOrEmpty(updatedUser.Username))
            {
                bookSoldUpdates.Add(Builders<BookSold>.Update.Set(b => b.Username, updatedUser.Username));
            }

            if (bookSoldUpdates.Any())
            {
                var bookSoldUpdate = Builders<BookSold>.Update.Combine(bookSoldUpdates);
                await _context.BookSold.UpdateManyAsync(bookSoldFilter, bookSoldUpdate);
            }

            return Ok(result); // Return the updated user object
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> SoftDeleteUser(string id)
        {
            var filter = Builders<User>.Filter.Eq("_id", new ObjectId(id));
            var update = Builders<User>.Update.Set("IsActive", false);

            var result = await _context.Users.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return NotFound( new {message = "User not found"});
            }

            return Ok(new { message = "User has been deactivated" });
        }

        [HttpPut("activate/{id}")]
        public async Task<IActionResult> ActivateUser(string id)
        {
             var currentUsername = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? "";
            

            var user = await _context.Users.Find(u => u.Username == currentUsername).FirstOrDefaultAsync();
            

            if (user == null || !user.IsAdmin)
            {
                return Forbid("You do not have permission to activate this user!");
            }

            var filter = Builders<User>.Filter.Eq("_id", new ObjectId(id));
            var update = Builders<User>.Update.Set("IsActive", true);

            var result = await _context.Users.UpdateOneAsync(filter, update);

            if (result.MatchedCount == 0)
            {
                return NotFound( new {message = "User not found"});
            }

            return Ok(new { message = "User has been activated"});
        }
    }
}
