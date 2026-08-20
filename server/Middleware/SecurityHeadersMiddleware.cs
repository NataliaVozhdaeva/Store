namespace Server.Middleware;

/// <summary>
/// ASP.NET Core Middleware injecting security headers to protect NovaEdge Store application 
/// against Clickjacking, XSS, MIME sniffing, and forcing HTTPS TLS connections.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Enforce HTTPS Strict-Transport-Security (HSTS) for 1 year
        context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";

        // Prevent clickjacking frame embedding
        context.Response.Headers["X-Frame-Options"] = "DENY";

        // Prevent MIME type sniffing attacks
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";

        // Enable Browser XSS Filtering
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";

        // Restrict referrer information sent on cross-origin requests
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // Content Security Policy (CSP) restricting unauthorized script execution
        context.Response.Headers["Content-Security-Policy"] = 
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:;";

        await _next(context);
    }
}
