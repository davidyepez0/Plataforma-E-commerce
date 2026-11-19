import bcrypt from 'bcrypt';
import pool from '../config/db.js';

async function register(req, res, next) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password || username.trim() === '' || email.trim() === '' || password.trim() === '') {
            return res.status(400).json({ success: false, message: 'All fields are required'});
        }

        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, contraseña, nombre) VALUES ($1, $2, $3) RETURNING *',
            [email, hashedPassword, username]
        );

        const { id, nombre, fecha_registro } = newUser.rows[0];

        res.status(201).json({ success: true, message: 'User created successfully', user: {id, email, nombre, fecha_registro } });
    }catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default register;