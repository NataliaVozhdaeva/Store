namespace Server.Middleware;

/// <summary>
/// Security Audit Middleware recording API request paths, HTTP methods, client IPs, 
/// response status codes, and security events for NovaEdge audit logging compliance.
/// Integrates with Azure Monitor / Log Analytics diagnostic stream.
/// </summary>
public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;

    public AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var path = request.Path;
        var method = request.Method;

        // Log sensitive API operations (Authentication, Customer Data Access)
        bool isSensitive = path.Value?.Contains("/api/customers", StringComparison.OrdinalIgnoreCase) == true;

        if (isSensitive)
        {
            _logger.LogInformation("[AUDIT-SECURITY-EVENT] Time={Time} | IP={IP} | Method={Method} | Path={Path} | DataAccessRequested",
                DateTime.UtcNow.ToString("o"), clientIp, method, path);
        }

        await _next(context);

        if (isSensitive)
        {
            _logger.LogInformation("[AUDIT-SECURITY-RESULT] Time={Time} | IP={IP} | Path={Path} | StatusCode={StatusCode}",
                DateTime.UtcNow.ToString("o"), clientIp, path, context.Response.StatusCode);
        }
    }
}
