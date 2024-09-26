using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;

namespace Apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(MongoDbContext context, IConfiguration configuration)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();
            if (user == null)
            {
                return Unauthorized("Invalid username or password");
            }

            // Check if the password is hashed
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                // If not, hash the plain text password and update the user record
                if (user.PasswordHash == request.Password)
                {
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                    await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
                }
                else
                {
                    return Unauthorized("Invalid username or password");
                }
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
        {
            var existingUser = await _context.Users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();
            var existingEmail = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest("Username already exists");
            }
            if (existingEmail != null)
            {
                return BadRequest("Email already exists");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
#pragma warning disable CS8601 // Possible null reference assignment.
            var user = new User
            {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = hashedPassword,
                IsActive = true
            };
#pragma warning restore CS8601 // Possible null reference assignment.

            await _context.Users.InsertOneAsync(user);

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
    }

    public class SignUpRequest
    {
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public bool IsActive { get; set; }
    }

    public class LoginRequest
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}
