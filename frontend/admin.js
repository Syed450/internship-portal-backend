async function addInternship() {

    const title =
        document.getElementById("title").value;

    const company =
        document.getElementById("company").value;

    const location =
        document.getElementById("location").value;

    const stipend =
        document.getElementById("stipend").value;

    const apply_link =
        document.getElementById("apply_link").value;

    const token =
        localStorage.getItem("token");

    if (!token) {

        alert("Please Login First");

        return;

    }

    try {

        const response = await fetch(

            "http://localhost:3000/internships",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    title,
                    company,
                    location,
                    stipend,
                    apply_link

                })

            }

        );

        const data =
            await response.json();

        alert(data.message);

    }

    catch (error) {

        console.log(error);

        alert("Error Adding Internship");

    }

}