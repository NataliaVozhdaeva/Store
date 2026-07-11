using Microsoft.EntityFrameworkCore;
using Server.Data;

var builder = WebApplication.CreateBuilder(args);

// Провайдер БД выбирается конфигом: локально — SQLite (файл), в облаке — SQL Server.
// Достаточно поменять DatabaseProvider + строку подключения, код не меняется.
var provider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=app.db";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (provider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
        options.UseSqlServer(connectionString);
    else
        options.UseSqlite(connectionString);
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: фронтенд в деве крутится на webpack-dev-server (другой порт),
// в проде отдаётся из wwwroot того же приложения. Токенов-cookie нет — авторизация
// через customerID в localStorage, поэтому AllowAnyOrigin безопасен для учебного демо.
builder.Services.AddCors(o => o.AddPolicy("app", p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Создание/миграция схемы и посев стартовых данных при запуске
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (db.Database.IsSqlite())
        db.Database.EnsureCreated();
    else
        db.Database.Migrate();
    SeedData.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("app");

// Отдача собранного фронтенда (webpack dist -> wwwroot) и SPA-fallback
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
