import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

dotenv.config({ path : '../../../../.env' });

async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password || username.trim() === '' || email.trim() === '' || password.trim() === '') {
            return res.status(400).json({ success: false, message: 'All fields are required'});
        }

        const emailCheck = await pool.query('SELECT email FROM users WHERE email = $1 LIMIT 1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            'INSERT INTO users (email, contraseña, nombre) VALUES ($1, $2, $3) RETURNING id, nombre, email, fecha_creacion',
            [email, hashedPassword, username]
        );

        const { id, nombre, fecha_registro } = newUser.rows[0];

        res.status(201).json({ success: true, message: 'User created successfully', user: {id, email, nombre, fecha_registro } });
    }catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password || email.trim() === '' || password.trim() === '') {
            return res.status(400).json({ success: false, message: 'All fields are required'});
        }

        const user = await pool.query('SELECT id, contraseña, email, nombre FROM users WHERE email = $1 LIMIT 1', [email]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].contraseña);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ success: true, message: 'Login successful', token: token });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

async function getMe (req, res) {
    try {
        const idUser = req.id;
        const user = await pool.query('SELECT id, nombre, email, fecha_creacion FROM users WHERE id = $1', [idUser]);
        if (!user.rows[0]) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        return res.status(200).json({ success: true, message: 'Authenticated user', user: user.rows[0] });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

async function putMe (req, res) {
    try {
        const idUser = req.id;
        const { username } = req.body;

        if (!username || username.trim() === '') {
             return res.status(400).json({ success: false, message: 'Username is required' }); 
        }

        const updateUser = await pool.query ('UPDATE users SET nombre = $1 WHERE id = $2 RETURNING id, nombre, email, fecha_creacion', [username, idUser]); 

        if (!updateUser.rows[0]) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: 'Updated information', user: updateUser.rows[0] });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { register, login, getMe, putMe };