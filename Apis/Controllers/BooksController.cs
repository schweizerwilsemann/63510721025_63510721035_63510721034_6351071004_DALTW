
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
}