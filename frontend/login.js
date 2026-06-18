const API_URL = "https://internship-portal-backend-production.up.railway.app";

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        const response = await fetch(

            `${API_URL}/login`,

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            }

        );

        const data = await response.json();

        if (data.token) {

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "role",
                data.user.role
            );

            document.getElementById(
                "message"
            ).innerText =
                "Login Successful";

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