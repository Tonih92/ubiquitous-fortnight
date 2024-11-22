// routes/register.js
import client from "../db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

// Helper function to validate if a string is a valid email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to check if a username (email) already exists
async function isUniqueUsername(email) {
    const result = await client.queryArray(`SELECT username FROM zephyr_users WHERE username = $1`, [email]);
    return result.rows.length === 0;
}

// Handle user registration
export async function registerUser(c) {
    const body = await c.req.parseBody();
    const username = body.username;
    const password = body.password;
    const birthdate = body.birthdate;
    const role = body.role;
    try {
        // Validate if username is an email
        if (!isValidEmail(username)) {
            return c.text('Invalid email address', 400);
        }

        // Validate username length (max 50 characters)
        if (username.length > 50) {
            return c.text('Username (email) must not exceed 50 characters', 400);
        }
        // Check if the email is unique
        if (!(await isUniqueUsername(username))) {
            return c.text('Email already in use', 400);
        }
        // Hash the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Insert the new user into the database
        await client.queryArray(
            `INSERT INTO zephyr_users (username, password_hash, role, birthdate) VALUES ($1, $2, $3, $4)`,
            [username, hashedPassword, role, birthdate]
        );

        // Success response
        return c.text('User registered successfully!');
    } catch (error) {
        console.error(error);
        return c.text('Error during registration', 500);
    }
}