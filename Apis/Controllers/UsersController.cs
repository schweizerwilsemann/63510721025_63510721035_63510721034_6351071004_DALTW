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
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto updatedUser)
        {
            var filter = Builders<User>.Filter.Eq("_id", new ObjectId(id));
            var updateDefinition = new List<UpdateDefinition<User>>();

            if (!string.IsNullOrEmpty(updatedUser.Email))
            {
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

            return Ok(result); // Trả về đối tượng người dùng đã cập nhật
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
