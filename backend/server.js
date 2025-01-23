const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*', // Geliştirme için. Prodüksiyonda spesifik origin belirtin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = {
    user: 'otistikselen',
    password: 'selen123.',
    server: 'DESKTOP-3CUMV3H',
    database: 'PetApp',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectionTimeout: 30000, // Bağlantı timeout süresini artırıyoruz
        requestTimeout: 30000     // İstek timeout süresini artırıyoruz
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// SQL Server connection pool
let pool;
async function initializePool() {
    try {
        pool = await sql.connect(config);
        console.log("Database connection pool initialized!");
    } catch (err) {
        console.error("Error initializing pool:", err);
        throw err;
    }
}

initializePool();

// JWT Token oluşturma
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.UserID, 
            email: user.Email, 
            userType: user.UserType,
            isEmailVerified: user.IsEmailVerified,
            isPhoneVerified: user.IsPhoneVerified
        },
        process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// Verification code generator
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
// server.js'de register endpoint'ini güncelle
app.post('/api/auth/register', async (req, res) => {
    console.log('Register request received:', req.body);
    try {
        const { firstName, lastName, email, password, phoneNumber, userType } = req.body;

        // Input validation
        if (!firstName || !lastName || !email || !password || !userType) {
            return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
        }

        try {
            // Email check
            const emailCheck = await pool.request()
                .input('email', sql.VarChar, email)
                .query('SELECT * FROM Users WHERE Email = @email');

            if (emailCheck.recordset.length > 0) {
                return res.status(400).json({ error: 'Bu email zaten kullanımda' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Basic insert query
            const insertQuery = `
                INSERT INTO Users (
                    FirstName,
                    LastName,
                    Email,
                    Password,
                    PhoneNumber,
                    UserType,
                    CreatedDate
                )
                OUTPUT INSERTED.*
                VALUES (
                    @firstName,
                    @lastName,
                    @email,
                    @password,
                    @phoneNumber,
                    @userType,
                    GETDATE()
                )
            `;

            const result = await pool.request()
                .input('firstName', sql.VarChar(50), firstName)
                .input('lastName', sql.VarChar(50), lastName)
                .input('email', sql.VarChar(100), email)
                .input('password', sql.VarChar(255), hashedPassword)
                .input('phoneNumber', sql.VarChar(15), phoneNumber)
                .input('userType', sql.VarChar(20), userType)
                .query(insertQuery);

            const newUser = result.recordset[0];

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: newUser.UserID,
                    email: newUser.Email,
                    userType: newUser.UserType
                },
                'your_jwt_secret_key',
                { expiresIn: '24h' }
            );

            // Remove sensitive data
            const { Password, ...userWithoutSensitive } = newUser;

            console.log('User registered successfully:', userWithoutSensitive);

            return res.status(201).json({
                ...userWithoutSensitive,
                token
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Veritabanı hatası: ' + dbError.message });
        }

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Kayıt işlemi başarısız: ' + error.message });
    }
});
// Auth endpoints
// server.js'de login endpoint'i
// server.js'de login endpoint'i
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, userType } = req.body;
        
        console.log('Login attempt:', { email, userType });

        // IsActive kontrolünü kaldırdık
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('userType', sql.VarChar, userType)
            .query(`
                SELECT UserID, Email, Password, UserType, FirstName, LastName, PhoneNumber, CreatedDate
                FROM Users 
                WHERE Email = @email 
                AND UserType = @userType
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
        }

        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Geçersiz kimlik bilgileri' });
        }

        // JWT token oluştur
        const token = jwt.sign(
            {
                userId: user.UserID,
                email: user.Email,
                userType: user.UserType
            },
            'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        // Hassas verileri çıkar
        const { Password, ...userWithoutPassword } = user;

        res.json({
            ...userWithoutPassword,
            token
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Giriş başarısız: ' + err.message });
    }
});

// Register endpoint


// Verify email endpoint
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('code', sql.VarChar, code)
            .query(`
                SELECT * FROM Users 
                WHERE Email = @email 
                AND VerificationCode = @code 
                AND VerificationCodeExpiry > GETDATE()
            `);

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş doğrulama kodu' });
        }

        await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                UPDATE Users 
                SET IsEmailVerified = 1, 
                    VerificationCode = NULL, 
                    VerificationCodeExpiry = NULL 
                WHERE Email = @email
            `);

        res.json({ message: 'Email doğrulandı' });

    } catch (err) {
        console.error("Email verification error:", err);
        res.status(500).json({ error: 'Doğrulama başarısız' });
    }
});

// Protected route örneği
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Erişim reddedildi' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Geçersiz token' });
    }
};

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query(`
                SELECT UserID, Email, PhoneNumber, UserType, 
                       IsPhoneVerified, IsEmailVerified, LastLoginDate, 
                       CreatedDate, IsActive 
                FROM Users 
                WHERE UserID = @userId
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ error: 'Profil bilgileri alınamadı' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Bir hata oluştu!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});