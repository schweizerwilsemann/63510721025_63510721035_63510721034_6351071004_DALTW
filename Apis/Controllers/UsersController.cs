
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Apis.Models;

namespace Apis.Controllers;
[ApiController]
[Route("api/[controller]")]

public class UsersController : ControllerBase{
    private readonly MongoDbContext _context;

    public UsersController(MongoDbContext context){
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers () {
        var users = await _context.Users.Find(FilterDefinition<User>.Empty).ToListAsync();
        return Ok(users);
    }
}