document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("startRecording");
    const stopButton = document.getElementById("stopRecording");
    const sendButton = document.getElementById("sendText");
    const description = document.getElementById("description");
    const genTicketButton = document.getElementById("generateTicket");

    let recognition;
    let isRecording = false;
    let transcription = "";

    // Check if the browser supports SpeechRecognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = "en-US"; // Set language
        recognition.interimResults = false; // Return final results only
        recognition.maxAlternatives = 1;
        recognition.continuous = true; // Keep recognition running until stopped

        // Event listener for results
        recognition.onresult = (event) => {
            transcription = Array.from(event.results)
                .map(result => result[0].transcript)
                .join(" ");
            console.log("Transcription:", transcription);
            description.value = transcription; // Autofill the description field
        };

        // Event listener for errors
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
        };

        // Event listener for end of recognition
        recognition.onend = () => {
            if (isRecording) {
                console.log("Speech recognition restarted due to pause.");
                recognition.start(); // Restart recognition to handle unexpected stops
            } else {
                console.log("Speech recognition stopped.");
                startButton.disabled = false;
                stopButton.disabled = true;
            }
        };
    } else {
        console.error("Speech Recognition API is not supported in this browser.");
        startButton.disabled = true;
        stopButton.disabled = true;
        return;
    }

    // Start recording
    startButton.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Start speaking please")
        if (!isRecording) {
            recognition.start();
            isRecording = true;
            startButton.disabled = true;
            stopButton.disabled = false;
            console.log("Speech recognition started.");
        }
    });

    // Stop recording
    stopButton.addEventListener("click", (e) => {
        e.preventDefault();
        if (isRecording) {
            isRecording = false;
            recognition.stop();
        }
    });

    // Send transcription to backend
    sendButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const data = {
            text: description.value
        };

        // console.log("Sending data to backend:", data);

        try {
            const response = await fetch("https://voice-ticket-backend.vercel.app/process-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // console.log("Response from backend:", result);
            let parsedResponse = JSON.parse(result);

                // Populate form fields
                document.getElementById("projectName").value = parsedResponse.Project_name || "";
                document.getElementById("department").value = parsedResponse.Department || "";
                document.getElementById("description").value = parsedResponse.Description || "";
                document.getElementById("severity").value = parsedResponse.Severity || "";
                document.getElementById("additionalNotes").value = parsedResponse.Additional_Notes || "";
                console.log("fields populated!")

        } catch (error) {
            console.error("Error sending data to backend:", error);
        }
    });

// gen ticket
async function createTicket() {
    // Get the form data
    const projectName = document.getElementById("projectName").value;
    const department = document.getElementById("department").value;
    const description = document.getElementById("description").value;
    const severity = document.getElementById("severity").value;
    // const dueDate = document.getElementById("dueDate").value;
    const additionalNotes = document.getElementById("additionalNotes").value;

    // Prepare the ticket data
    const ticketData = {
        subject: `Ticket for ${projectName} - ${department} Department`,
        // dueDate: dueDate,  // Format this date as needed
        departmentId: "722569000000006907",  // Zoho department ID (replace with actual one if needed)
        // channel: "Email",  // Assuming the ticket is created via email
        description: `${description}\n\nAdditional Notes: ${additionalNotes}`,
        language: "English",
        priority: severity,  // Assuming "Low", "Medium", "High" are mapped to the severity
        status: "Open",  // Set initial status as Open
        category: "general",  // Assuming a general category, modify as needed
        // email: "support@example.com",  // Replace with actual email of the user or team
        contactId: "722569000000722001",  // Replace with actual contact ID
        productId: "",  // Can be set based on your project/product structure
        // assigneeId: "1892000000056007",  // Replace with the ID of the assignee
        cf: {
            cf_permanentaddress: null,
            cf_dateofpurchase: null,
            cf_phone: null,
            cf_numberofitems: null,
            cf_url: null,
            cf_secondaryemail: null,
            cf_severitypercentage: "0.0",
            cf_modelname: "F3 2017"
        },
        // Optional: other custom fields can be added here if required by your Zoho Helpdesk instance
    };

    try {
        const response = await fetch("https://voice-ticket-backend.vercel.app/api/create-ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Ticket created successfully:", result);
        alert("Ticket created successfully!");
    } catch (error) {
        console.error("Error creating ticket:", error);
        alert("Failed to create ticket. Please try again.");
    }
}


genTicketButton.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("generating ticket..")
    createTicket();
})

});



