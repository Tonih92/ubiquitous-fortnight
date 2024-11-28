// routes/login.js
import client from "../db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

// Handle user login
export async function loginUser(c) {
    const body = await c.req.parseBody();
    const username = body.username;
    const password = body.password;

    try {
        // Fetch user by username (email)
        const result = await client.queryArray(
            `SELECT password_hash FROM zephyr_users WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return c.text('Invalid username or password', 401);
        }

        const [hashedPassword] = result.rows[0];

        // Compare provided password with stored hash
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        if (!isValidPassword) {
            return c.text('Invalid username or password', 401);
        }

        // Success response
        return c.text('Login successful!');
    } catch (error) {
        console.error(error);
        return c.text('Error during login', 500);
    }
}
