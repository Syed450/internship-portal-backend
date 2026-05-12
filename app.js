const express = require("express");
const app = express();

const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Internship Portal Backend Running");
});
app.get("/internships",(req,res)=>{
    const sql="select * from internships";
    db.query(sql,(err,result)=>{
        if(err){
            return res.send("error message");
        }
        res.json(result);
    });
});
app.post("/internships", (req, res) => {

    const { title, company, location, stipend } = req.body;

    if (!title || !company || !location || !stipend) {
        return res.send("Please provide all fields");
    }

    const sql = `
        INSERT INTO internships (title, company, location, stipend)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, company, location, stipend],
        (err, result) => {

            if (err) {
                return res.send("Database insert error");
            }

            res.send("Internship added successfully");
        }
    );
});
app.delete("/internships/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM internships WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.send("Database delete error");
        }

        if (result.affectedRows === 0) {
            return res.send("Internship not found");
        }

        res.send("Internship deleted successfully");
    });
});
app.put("/internships/:id", (req, res) => {

    const id = req.params.id;

    const { title, company, location, stipend } = req.body;

    if (!title || !company || !location || !stipend) {
        return res.send("Please provide all fields");
    }

    const sql = `
        UPDATE internships
        SET title = ?, company = ?, location = ?, stipend = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [title, company, location, stipend, id],
        (err, result) => {

            if (err) {
                return res.send("Database update error");
            }

            if (result.affectedRows === 0) {
                return res.send("Internship not found");
            }

            res.send("Internship updated successfully");
        }
    );
});
app.post("/bulk-internships", (req, res) => {

    const internships = req.body;

    if (!Array.isArray(internships)) {
        return res.send("Please send array data");
    }

    internships.forEach((internship) => {

        const { title, company, location, stipend } = internship;

        if (!title || !company || !location || !stipend) {
            return res.send("provide all the essential fields of data");
        }

        const sql = `
            INSERT INTO internships
            (title, company, location, stipend)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [title, company, location, stipend],
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        );
    });

    res.send("Bulk internships added");
});
// regsiter api
app.post("/register", async (req, res) => {

    const { name, email, password, role } = req.body;

    // validation
    if (!name || !email || !password || !role) {
        return res.send("Please provide all fields");
    }

    try {

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, hashedPassword, role],
            (err, result) => {

                if (err) {
                    console.log(err);
                    return res.send("Registration error");
                }

                res.send("User registered successfully");
            }
        );

    } catch (error) {

        console.log(error);
        res.send("Server error");

    }

});



//login api
// LOGIN API

app.post("/login", async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        // validation
        if (!email || !password) {
            return res.send("Email and password required");
        }

        // find user
        const sql = "SELECT * FROM users WHERE email = ?";

        db.query(sql, [email], async (err, result) => {

            if (err) {
                console.log(err);
                return res.send("eroor message");
            }

            // check user exists
            if (result.length === 0) {
                return res.send("No user found");
            }

            const user = result[0];

            // compare password
            const checkPassword = await bcrypt.compare(
                password,
                user.password
            );

            if (checkPassword) {

                // generate JWT token
                const token = jwt.sign(

                    {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    },

                    "hackerscannothack11",

                    {
                        expiresIn: "1h"
                    }

                );

                // send response
                res.send({

                    message: "Login successful",

                    token: token,

                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }

                });

            } else {

                res.send("Wrong password");

            }

        });

    } catch (error) {

        console.log(error);
        res.send("Server error");

    }

});


// VERIFY TOKEN MIDDLEWARE

const verifytheToken = (req, res, next) => {

    const header = req.headers.authorization;

    // check token exists
    if (!header) {
        return res.send("Access denied");
    }

    // extract token
    const token = header.split(" ")[1];

    try {

        // verify token
        const verified = jwt.verify(
            token,
            "hackerscannothack11"
        );

        // store decoded user
        req.user = verified;

        next();

    } catch (error) {

        res.send("Invalid token");

    }

};


// ADMIN ONLY MIDDLEWARE

const adminOnly = (req, res, next) => {

    if (req.user.role !== "admin") {
        return res.send("Only admin can access");
    }

    next();

};
app.get("/users",(req,res)=>{
    const sql = "select * from users";
    db.query(sql,(err,result)=>{
        if(err){
            return res.send("Dataabse error try again ");
        }
        else{
            res.json(result);
        }
    });

});
app.get("/profile", verifytheToken, (req, res) => {

    res.send({

        message: "Protected profile accessed",

        user: req.user

    });

});
app.post(
    "/apply/:internshipId",
    verifytheToken,
    (req, res) => {

        const student_id = req.user.id;

        const internship_id = req.params.internshipId;

        const status = "applied";

        // check already applied
        const checkSql = `SELECT * FROM applications WHERE student_id = ? AND internship_id = ?`;
        db.query(checkSql,[student_id, internship_id],(err, result) => {

                if(err){
                    console.log(err);
                    return res.send("Database error");
                }

                // already applied
                if(result.length > 0){
                    return res.send("Already applied");
                }

                // insert new application
                const sql = `INSERT INTO applications (student_id, internship_id, status) VALUES (?, ?, ?)`;

                db.query(sql,[student_id, internship_id, status],(err, result) => {

                        if(err){
                            console.log(err);
                            return res.send("Database error");
                        }

                        res.send("Application added successfully");

                    }
                );

            }
        );

    }
);
app.get("/applications", (req, res) => {

    const sql = "SELECT * FROM applications";

    db.query(sql, (err, result) => {

        if(err){
            return res.send("Database error");
        }

        res.json(result);

    });

});
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});