// =======================================
// AUTH CHECK
// =======================================

const token =
    localStorage.getItem(
        "token"
    );

if (!token) {

    window.location.href =
        "login.html";

}

// =======================================
// CHECK USER ROLE
// =======================================

const role =
    localStorage.getItem(
        "role"
    );

const adminLink =
    document.getElementById(
        "admin-link"
    );

if (
    role === "admin" &&
    adminLink
) {

    adminLink.style.display =
        "inline-block";

}

// =======================================
// FETCH ALL INTERNSHIPS
// =======================================

fetch(
    "http://localhost:3000/internships"
)

.then(
    response =>
        response.json()
)

.then(data => {

    const internshipsDiv =
        document.getElementById(
            "internships"
        );

    internshipsDiv.innerHTML = "";

    data.forEach(internship => {

        internshipsDiv.innerHTML += `

            <div class="card">

                <h2>
                    ${internship.title}
                </h2>

                <p>
                    <strong>Company:</strong>
                    ${internship.company}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${internship.location}
                </p>

                <p>
                    <strong>Stipend:</strong>
                    ₹${internship.stipend}
                </p>

                <a
                    href="${internship.apply_link}"
                    target="_blank"
                    class="apply-link-btn"
                >
                    Apply On Company Website
                </a>

                <br><br>

                <button
                    onclick="
                        applyInternship(
                            ${internship.id}
                        )
                    "
                >
                    Mark As Applied
                </button>

                ${
                    role === "admin"
                    ?
                    `
                    <br><br>

                    <button
                        class="delete-btn"
                        onclick="
                            deleteInternship(
                                ${internship.id}
                            )
                        "
                    >
                        Delete Internship
                    </button>
                    `
                    :
                    ""
                }

            </div>

        `;

    });

})

.catch(error => {

    console.log(
        "Error:",
        error
    );

});

// =======================================
// APPLY INTERNSHIP
// =======================================

async function applyInternship(id) {

    const token =
        localStorage.getItem(
            "token"
        );

    if (!token) {

        alert(
            "Please Login First"
        );

        return;

    }

    try {

        const response =
            await fetch(

                `http://localhost:3000/apply/${id}`,

                {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

        const data =
            await response.json();

        alert(
            data.message
        );

    }

    catch (error) {

        console.log(
            error
        );

    }

}

// =======================================
// DELETE INTERNSHIP
// =======================================

async function deleteInternship(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this internship?"
        );

    if (!confirmDelete) {

        return;

    }

    try {

        const response =
            await fetch(

                `http://localhost:3000/internships/${id}`,

                {

                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

        const data =
            await response.json();

        alert(
            data.message
        );

        location.reload();

    }

    catch (error) {

        console.log(
            "DELETE ERROR:",
            error
        );

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
        "Logged Out Successfully"
    );

    window.location.href =
        "login.html";

}