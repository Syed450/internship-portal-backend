// =======================================
// APPLICATION PAGE
// =======================================

const container =
    document.getElementById(
        "application-container"
    );

const token =
    localStorage.getItem(
        "token"
    );

// =======================================
// AUTH CHECK
// =======================================

if (!token) {

    container.innerHTML = `

        <h2 class="error">

            Please Login First

        </h2>

    `;

} else {

    fetchApplications();

}

// =======================================
// FETCH APPLICATIONS
// =======================================

async function fetchApplications() {

    try {

        const response =
            await fetch(

                "http://localhost:3000/my-applications",

                {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );

        const data =
            await response.json();

        console.log(data);

        container.innerHTML = "";

        // ERROR MESSAGE
        if (data.message) {

            container.innerHTML = `

                <h2 class="error">

                    ${data.message}

                </h2>

            `;

            return;

        }

        // NO APPLICATIONS
        if (data.length === 0) {

            container.innerHTML = `

                <h2>

                    No Applications Found

                </h2>

            `;

            return;

        }

        // DISPLAY APPLICATIONS
        data.forEach((app) => {

            const card =
                document.createElement(
                    "div"
                );

            card.classList.add(
                "application-card"
            );

            card.innerHTML = `

                <h2>
                    ${app.title}
                </h2>

                <p>
                    <strong>Company:</strong>
                    ${app.company}
                </p>

                <p>
                    <strong>Location:</strong>
                    ${app.location}
                </p>

                <p>
                    <strong>Current Status:</strong>
                    ${app.status}
                </p>

                <select
                    onchange="
                        updateStatus(
                            ${app.id},
                            this.value
                        )
                    "
                >

                    <option
                        value="Applied"
                        ${
                            app.status === "Applied"
                            ? "selected"
                            : ""
                        }
                    >
                        Applied
                    </option>

                    <option
                        value="Assessment Round"
                        ${
                            app.status ===
                            "Assessment Round"
                            ? "selected"
                            : ""
                        }
                    >
                        Assessment Round
                    </option>

                    <option
                        value="Technical Round"
                        ${
                            app.status ===
                            "Technical Round"
                            ? "selected"
                            : ""
                        }
                    >
                        Technical Round
                    </option>

                    <option
                        value="HR Round"
                        ${
                            app.status ===
                            "HR Round"
                            ? "selected"
                            : ""
                        }
                    >
                        HR Round
                    </option>

                    <option
                        value="Selected"
                        ${
                            app.status ===
                            "Selected"
                            ? "selected"
                            : ""
                        }
                    >
                        Selected
                    </option>

                    <option
                        value="Rejected"
                        ${
                            app.status ===
                            "Rejected"
                            ? "selected"
                            : ""
                        }
                    >
                        Rejected
                    </option>

                </select>

            `;

            container.appendChild(
                card
            );

        });

    } catch (error) {

        console.log(
            "FETCH ERROR:",
            error
        );

        container.innerHTML = `

            <h2 class="error">

                Failed To Fetch Applications

            </h2>

        `;

    }

}

// =======================================
// UPDATE APPLICATION STATUS
// =======================================

async function updateStatus(
    id,
    status
) {

    try {

        const response =
            await fetch(

                `http://localhost:3000/applications/${id}`,

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            status

                        })

                }

            );

        const data =
            await response.json();

        console.log(data);

        alert(
            data.message
        );

        // Refresh Applications
        fetchApplications();

    } catch (error) {

        console.log(
            "STATUS UPDATE ERROR:",
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