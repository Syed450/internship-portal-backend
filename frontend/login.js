// =======================================
// LOGIN
// =======================================

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        const response = await fetch(

            "http://localhost:3000/login",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    email,
                    password

                })

            }

        );

        const data =
            await response.json();

        console.log(data);

        if (data.token) {

            // Store JWT Token
            localStorage.setItem(
                "token",
                data.token
            );

            // Store User Role
            localStorage.setItem(
                "role",
                data.user.role
            );

            document.getElementById(
                "message"
            ).innerText =
                "Login Successful";

            // Redirect User
            window.location.href =
                "index.html";

        } else {

            document.getElementById(
                "message"
            ).innerText =
                data.message;

        }

    } catch (error) {

        console.log(error);

        document.getElementById(
            "message"
        ).innerText =
            "Server Error";

    }

}


// =======================================
// LOGOUT
// =======================================

function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "role"
    );

    alert(
        "Logged out successfully"
    );

    window.location.href =
        "login.html";

}