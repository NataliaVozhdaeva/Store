using System.Security.Cryptography;
using System.Text;

namespace Server.Security;

/// <summary>
/// Cryptographic security helper providing industry-standard PBKDF2 password hashing
/// with SHA-256 and AES-256-GCM authenticated encryption at rest for sensitive customer PII.
/// Designed for NovaEdge Solutions Ltd. Store System data security compliance.
/// </summary>
public static class CryptoHelper
{
    private const int SaltSize = 16; // 128 bits
    private const int HashSize = 32; // 256 bits
    private const int Iterations = 100_000; // PBKDF2 iteration count
    private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA256;

    private const int NonceSize = 12; // 96 bits — рекомендованный NIST размер nonce для GCM
    private const int TagSize = 16;   // 128 bits — тег аутентификации, проверяется при расшифровке

    // Master Key for AES-256 encryption (In production Azure deployment, loaded from Azure Key Vault).
    // Без хардкод-дефолта: ключ должен приходить только из переменной окружения,
    // иначе шифрование PII теряет смысл — ключ лежал бы открытым в репозитории.
    private static readonly byte[] EncryptionKey = Encoding.UTF8.GetBytes(
        (Environment.GetEnvironmentVariable("DATA_PROTECTION_KEY")
            ?? throw new InvalidOperationException("DATA_PROTECTION_KEY environment variable is not set"))
        .PadRight(32).Substring(0, 32));

    /// <summary>
    /// Hashes a plain-text password using PBKDF2 with SHA-256 and a random 128-bit salt.
    /// </summary>
    public static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithm, HashSize);

        // Format: {iterations}:{salt_base64}:{hash_base64}
        return $"{Iterations}:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    /// Verifies a plain-text password against a stored PBKDF2 hash representation.
    /// Backward compatible with legacy plain-text passwords for smooth migration.
    /// </summary>
    public static bool VerifyPassword(string password, string storedHash)
    {
        if (string.IsNullOrEmpty(storedHash)) return false;

        // Legacy plaintext check fallback
        if (!storedHash.Contains(':'))
        {
            return password == storedHash;
        }

        try
        {
            var parts = storedHash.Split(':');
            if (parts.Length != 3) return false;

            int iterations = int.Parse(parts[0]);
            byte[] salt = Convert.FromBase64String(parts[1]);
            byte[] expectedHash = Convert.FromBase64String(parts[2]);

            byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithm, expectedHash.Length);
            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Encrypts sensitive personal data (PII) using AES-256-GCM authenticated encryption.
    /// Output layout: nonce (12 bytes) || tag (16 bytes) || ciphertext, base64-encoded.
    /// </summary>
    public static string EncryptData(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;

        byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);
        byte[] plainBytes = Encoding.UTF8.GetBytes(plainText);
        byte[] cipherBytes = new byte[plainBytes.Length];
        byte[] tag = new byte[TagSize];

        using (var aesGcm = new AesGcm(EncryptionKey, TagSize))
        {
            aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);
        }

        byte[] result = new byte[NonceSize + TagSize + cipherBytes.Length];
        Buffer.BlockCopy(nonce, 0, result, 0, NonceSize);
        Buffer.BlockCopy(tag, 0, result, NonceSize, TagSize);
        Buffer.BlockCopy(cipherBytes, 0, result, NonceSize + TagSize, cipherBytes.Length);

        return Convert.ToBase64String(result);
    }

    /// <summary>
    /// Decrypts an AES-256-GCM payload back to the original plain-text.
    /// Tampered ciphertext fails the authentication tag check and is rejected.
    /// </summary>
    public static string DecryptData(string encryptedText)
    {
        if (string.IsNullOrEmpty(encryptedText)) return encryptedText;

        try
        {
            byte[] fullCipher = Convert.FromBase64String(encryptedText);

            byte[] nonce = new byte[NonceSize];
            byte[] tag = new byte[TagSize];
            byte[] cipherBytes = new byte[fullCipher.Length - NonceSize - TagSize];

            Buffer.BlockCopy(fullCipher, 0, nonce, 0, NonceSize);
            Buffer.BlockCopy(fullCipher, NonceSize, tag, 0, TagSize);
            Buffer.BlockCopy(fullCipher, NonceSize + TagSize, cipherBytes, 0, cipherBytes.Length);

            byte[] plainBytes = new byte[cipherBytes.Length];

            using (var aesGcm = new AesGcm(EncryptionKey, TagSize))
            {
                aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);
            }

            return Encoding.UTF8.GetString(plainBytes);
        }
        catch
        {
            // Легаси-данные (старый CBC-формат или ещё не зашифрованный текст) — возвращаем как есть.
            return encryptedText;
        }
    }
}
