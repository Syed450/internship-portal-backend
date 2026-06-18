require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log("DB_HOST:", process.env.DB_HOST);
        console.log("DB_USER:", process.env.DB_USER);
        console.log("DB_NAME:", process.env.DB_NAME);
        console.log("DB_PORT:", process.env.DB_PORT);
        console.log("Database connection failed:", err);
    } else {
        console.log("Database connected successfully");
    }
});

module.exports = connection;