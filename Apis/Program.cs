using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Apis.Models;
using MongoDB.Driver;
using MongoDB.Bson; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;

var builder = WebApplication.CreateBuilder(args);

var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb") 
                            ?? throw new InvalidOperationException("MongoDb connection string not found.");

var databaseName = "Library";

builder.Services.AddSingleton(new MongoDbContext(mongoConnectionString, databaseName));
builder.Services.AddControllers();
builder.Services.AddSession();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddUserSecrets<Program>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    
})

.AddJwtBearer(options =>
{
    var key = builder.Configuration["Jwt:Key"];
    Console.WriteLine($"JWT Key Length: {key.Length}");
    Console.WriteLine($"JWT Key: {key}");
    if (key == null || key.Length < 16)
    {
        throw new InvalidOperationException("JWT key is not configured or too short.");
    }
    var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = signingKey,
        ClockSkew = TimeSpan.Zero 
    };
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseSession(); 
app.UseAuthentication(); 
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
    try
    {
        await context.Database.RunCommandAsync((Command<BsonDocument>)"{ping:1}");
        Console.WriteLine("MongoDB connected successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"MongoDB connection failed: {ex.Message}");
    }
}

app.MapGet("/", () => "Hello World!");

app.Run();
