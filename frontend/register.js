const API_URL = "https://internship-portal-backend-production.up.railway.app";

async function register() {

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        const response =
            await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        console.log(data);

        document.getElementById("message")
            .innerText = data.message;

    }

    catch (error) {

        console.log(error);

        document.getElementById("message")
            .innerText = "Server Error";

    }

}

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    alert("Logged out successfully");

    window.location.href =
        "login.html";

}