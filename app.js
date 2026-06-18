// =======================================
// INTERNSHIP MANAGEMENT SYSTEM BACKEND
// FULL PROJECT IN SINGLE FILE
// =======================================

// ---------- IMPORTS ----------

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());

// =======================================
// DATABASE CONNECTION
// =======================================

const db = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME

});

db.connect((err) => {

    if (err) {

        console.error("Database connection failed:", err);

    } else {

        console.log("Database connected successfully");

    }

});

// =======================================
// DEFAULT ROUTE
// =======================================

app.get("/", (req, res) => {

    res.status(200).json({

        message: "Internship Portal Backend Running"

    });

});

// =======================================
// JWT VERIFY TOKEN MIDDLEWARE
// =======================================

const verifyToken = (req, res, next) => {

    const header = req.headers.authorization;

    console.log("HEADER:", header);

    if (!header) {

        return res.status(401).json({
            message: "Access denied"
        });

    }

    const token = header.split(" ")[1];

    console.log("TOKEN:", token);

    try {

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("VERIFIED USER:", verified);

        req.user = verified;

        next();

    } catch (error) {

        console.log(
            "JWT ERROR:",
            error.message
        );

        return res.status(401).json({
            message: "Invalid token"
        });

    }

};

// =======================================
// ADMIN ONLY MIDDLEWARE
// =======================================

const adminOnly = (req, res, next) => {

    if (req.user.role !== "admin") {

        return res.status(403).json({

            message: "Only admin can access"

        });

    }

    next();

};

// =======================================
// REGISTER API
// =======================================

app.post("/register", async (req, res) => {

    try {

        const { name, email, password} = req.body;

        // validation
        if (!name || !email || !password ) {

            return res.status(400).json({

                message: "Please provide all fields"

            });

        }

        // check email already exists
        const checkSql =
            "SELECT * FROM users WHERE email = ?";

        db.query(
            checkSql,
            [email],
            async (err, result) => {

                if (err) {

                    return res.status(500).json({

                        message: "Database error"

                    });

                }

                if (result.length > 0) {

                    return res.status(400).json({

                        message: "Email already exists"

                    });

                }

                // hash password
                const hashedPassword =
                    await bcrypt.hash(password, 10);

                // insert user
                const sql = `
                    INSERT INTO users
                    (name, email, password,role)
                    VALUES (?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        name,
                        email,
                        hashedPassword,
                        "student"
                    ],
                    (err, result) => {

                        if (err) {

                            return res.status(500).json({

                                message: "Registration failed"

                            });

                        }

                        res.status(201).json({

                            message:
                                "User registered successfully"

                        });

                    }
                );

            }
        );

    } catch (error) {

        res.status(500).json({

            message: "Server error"

        });

    }

});

// =======================================
// LOGIN API
// =======================================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // validation
        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password required"

            });

        }

        // find user
        const sql =
            "SELECT * FROM users WHERE email = ?";

        db.query(
            sql,
            [email],
            async (err, result) => {

                if (err) {

                    return res.status(500).json({

                        message: "Database error"

                    });

                }

                // user exists or not
                if (result.length === 0) {

                    return res.status(404).json({

                        message: "No user found"

                    });

                }

                const user = result[0];

                // compare password
                const checkPassword =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!checkPassword) {

                    return res.status(401).json({

                        message: "Wrong password"

                    });

                }

                // generate token
                const token = jwt.sign(

                    {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn: "1h"
                    }

                );

                // response
                res.status(200).json({

                    message: "Login successful",

                    token,

                    user: {

                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role

                    }

                });

            }
        );

    } catch (error) {

        res.status(500).json({

            message: "Server error"

        });

    }

});

// =======================================
// GET ALL INTERNSHIPS
// =======================================

app.get("/internships", (req, res) => {

    const sql = "SELECT * FROM internships";

    db.query(sql, (err, result) => {

        if (err) {

            return res.status(500).json({

                message: "Database error"

            });

        }

        res.status(200).json(result);

    });

});

// =======================================
// GET SINGLE INTERNSHIP
// =======================================

app.get("/internships/:id", (req, res) => {

    const id = req.params.id;

    const sql =
        "SELECT * FROM internships WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            return res.status(500).json({

                message: "Database error"

            });

        }

        if (result.length === 0) {

            return res.status(404).json({

                message: "Internship not found"

            });

        }

        res.status(200).json(result[0]);

    });

});

// =======================================
// ADD INTERNSHIP
// =======================================
app.post(
    "/internships",
    verifyToken,
    adminOnly,
    (req, res) => {

        const {
            title,
            company,
            location,
            stipend,
            apply_link
        } = req.body;

        // VALIDATION
        if (
            !title ||
            !company ||
            !location ||
            !stipend ||
            !apply_link
        ) {

            return res.status(400).json({

                message:
                    "Please provide all fields"

            });

        }

        // CHECK DUPLICATE
        const checkSql = `
            SELECT * FROM internships
            WHERE title = ?
            AND company = ?
        `;

        db.query(
            checkSql,
            [
                title,
                company
            ],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        message:
                            "Database error"

                    });

                }

                if (result.length > 0) {

                    return res.status(400).json({

                        message:
                            "Internship already exists"

                    });

                }

                // INSERT INTERNSHIP
                const sql = `
                    INSERT INTO internships
                    (
                        title,
                        company,
                        location,
                        stipend,
                        apply_link
                    )
                    VALUES (?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        title,
                        company,
                        location,
                        stipend,
                        apply_link
                    ],
                    (err, result) => {

                        if (err) {

                            return res.status(500).json({

                                message:
                                    "Database insert error"

                            });

                        }

                        res.status(201).json({

                            message:
                                "Internship added successfully"

                        });

                    }
                );

            }
        );

    }
);

// =======================================
// UPDATE INTERNSHIP
// =======================================

app.put(
    "/internships/:id",
    verifyToken,
    adminOnly,
    (req, res) => {

        const id = req.params.id;

        const {
            title,
            company,
            location,
            stipend
        } = req.body;

        const sql = `
            UPDATE internships
            SET title = ?,
                company = ?,
                location = ?,
                stipend = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                title,
                company,
                location,
                stipend,
                id
            ],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        message:
                            "Database update error"

                    });

                }

                res.status(200).json({

                    message:
                        "Internship updated successfully"

                });

            }
        );

    }
);

// =======================================
// DELETE INTERNSHIP
// =======================================

app.delete(
    "/internships/:id",
    verifyToken,
    adminOnly,
    (req, res) => {

        const id = req.params.id;

        const sql =
            "DELETE FROM internships WHERE id = ?";

        db.query(sql, [id], (err, result) => {

            if (err) {

                return res.status(500).json({

                    message:
                        "Database delete error"

                });

            }

            res.status(200).json({

                message:
                    "Internship deleted successfully"

            });

        });

    }
);

// =======================================
// SEARCH INTERNSHIPS
// =======================================

app.get("/search", (req, res) => {

    const location = req.query.location;

    const sql = `
        SELECT * FROM internships
        WHERE location LIKE ?
    `;

    db.query(
        sql,
        [`%${location}%`],
        (err, result) => {

            if (err) {

                return res.status(500).json({

                    message: "Database error"

                });

            }

            res.status(200).json(result);

        }
    );

});

// =======================================
// APPLY FOR INTERNSHIP
// =======================================

app.post(
    "/apply/:internshipId",
    verifyToken,
    (req, res) => {

        const student_id = req.user.id;

        const internship_id =
            req.params.internshipId;

        const status = "Applied";

        // already applied check
        const checkSql = `
            SELECT * FROM applications
            WHERE student_id = ?
            AND internship_id = ?
        `;

        db.query(
            checkSql,
            [
                student_id,
                internship_id
            ],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        message: "Database error"

                    });

                }

                if (result.length > 0) {

                    return res.status(400).json({

                        message:
                            "Already applied"

                    });

                }

                // insert application
                const sql = `
                    INSERT INTO applications
                    (student_id, internship_id, status)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        student_id,
                        internship_id,
                        status
                    ],
                    (err, result) => {

                        if (err) {

                            return res.status(500).json({

                                message:
                                    "Application failed"

                            });

                        }

                        res.status(201).json({

                            message:
                                "Application added successfully"

                        });

                    }
                );

            }
        );

    }
);
// =======================================
// MY APPLICATIONS
// =======================================

app.get(
    "/my-applications",
    verifyToken,
    (req, res) => {

        const student_id = req.user.id;

        const sql = `
            SELECT
                applications.id,
                internships.title,
                internships.company,
                internships.location,
                applications.status

            FROM applications

            JOIN internships
            ON applications.internship_id =
            internships.id

            WHERE applications.student_id = ?
        `;

        db.query(
            sql,
            [student_id],
            (err, result) => {

                if (err) {

                    return res.status(500).json({
                        message: "Database error"
                    });

                }

                res.status(200).json(result);

            }
        );

    }
);
// =======================================
// GET ALL USERS
// =======================================

app.get(
    "/users",
    verifyToken,
    adminOnly,
    (req, res) => {

        const sql = "SELECT * FROM users";

        db.query(sql, (err, result) => {

            if (err) {

                return res.status(500).json({

                    message: "Database error"

                });

            }

            res.status(200).json(result);

        });

    }
);

// =======================================
// PROFILE API
// =======================================

app.get(
    "/profile",
    verifyToken,
    (req, res) => {

        res.status(200).json({

            message:
                "Protected profile accessed",

            user: req.user

        });

    }
);

// =======================================
// ADMIN DASHBOARD
// =======================================

app.get(
    "/admin/dashboard",
    verifyToken,
    adminOnly,
    (req, res) => {

        const dashboardData = {};

        db.query(
            "SELECT COUNT(*) AS totalUsers FROM users",
            (err, usersResult) => {

                dashboardData.totalUsers =
                    usersResult[0].totalUsers;

                db.query(
                    "SELECT COUNT(*) AS totalInternships FROM internships",
                    (err, internshipsResult) => {

                        dashboardData.totalInternships =
                            internshipsResult[0]
                                .totalInternships;

                        db.query(
                            "SELECT COUNT(*) AS totalApplications FROM applications",
                            (
                                err,
                                applicationsResult
                            ) => {

                                dashboardData.totalApplications =
                                    applicationsResult[0]
                                        .totalApplications;

                                res.status(200).json(
                                    dashboardData
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);
// =======================================
// UPDATE APPLICATION STATUS
// =======================================

app.put(
    "/applications/:id",
    verifyToken,
    (req, res) => {

        const applicationId =
            req.params.id;

        const { status } =
            req.body;

        const sql = `
            UPDATE applications
            SET status = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                status,
                applicationId
            ],
            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        message:
                        "Database Error"

                    });

                }

                res.status(200).json({

                    message:
                    "Status Updated Successfully"

                });

            }
        );

    }
);

// =======================================
// SERVER
// =======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});