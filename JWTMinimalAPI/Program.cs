using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JWTMinimalAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddAuthorization();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(o =>
            {
                o.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey
                    (Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                };
            });
            builder.Services.AddAuthorization();
            var app = builder.Build();

            app.MapPost("security/createToken",
                [AllowAnonymous] (User user) =>
                {
                    if (user.Username == "user" && user.Password == "user123")
                    {
                        var issuer = builder.Configuration["Jwt:Issuer"];
                        var audience = builder.Configuration["Jwt:Audience"];
                        var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"]);
                        var tokenDiscriptor = new SecurityTokenDescriptor
                        {
                            Subject = new System.Security.Claims.ClaimsIdentity(new[]
                            {
                                new Claim("Id",Guid.NewGuid().ToString()),
                                new Claim(JwtRegisteredClaimNames.Sub,user.Username),
                                new Claim(JwtRegisteredClaimNames.Email,user.Username),
                                new Claim(JwtRegisteredClaimNames.Jti,Guid.NewGuid().ToString())
                            }),
                            Expires = DateTime.UtcNow.AddMinutes(5),
                            Issuer = issuer,
                            Audience = audience,
                            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                            SecurityAlgorithms.HmacSha512Signature)
                        };
                        var tokenHandler = new JwtSecurityTokenHandler();
                        var token = tokenHandler.CreateToken(tokenDiscriptor);
                        var jwttoken = tokenHandler.WriteToken(token);
                        var stringtoken = tokenHandler.WriteToken(token);
                        return Results.Ok(stringtoken);
                    }
                    return Results.Unauthorized();
                });

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.MapGet("Jwt/demo",()=>"Hello My World!").RequireAuthorization();

            app.UseAuthentication();
            app.UseAuthorization();          

            app.Run();
        }
    }
}