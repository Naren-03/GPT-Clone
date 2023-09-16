// Function to add a user message to the chat box
function addUserMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const userMessageElement = document.createElement('div');
    userMessageElement.classList.add('chat-message', 'user-message');
    userMessageElement.textContent = message;
    chatBox.appendChild(userMessageElement);


    const userChatHistory = JSON.parse(localStorage.getItem('UserQuestionHistory')) || [];
    // userChatHistory.push({ type: 'Que', message: message });
    // localStorage.setItem('UserQuestionHistory', JSON.stringify(userChatHistory))

    const isQuestionInHistory = userChatHistory.some(item => item.message === message && item.type === 'Que');
    
    if (!isQuestionInHistory) {
        // Add the user's message to the chat history if it's not already present
        userChatHistory.push({ type: 'Que', message: message });
        localStorage.setItem('UserQuestionHistory', JSON.stringify(userChatHistory));
    }

}

// Function to add an AI message to the chat box
function addAiMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const aiMessageElement = document.createElement('div');
    aiMessageElement.classList.add('chat-message','ai-message');
    aiMessageElement.textContent = message;
    chatBox.appendChild(aiMessageElement);
}

// Function to send user input to the server
function sendUserInput() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim() !== '') {
        // Add the user's question to the chat box
        addUserMessage(userInput);

        // Disable the "Ask" button while waiting for the response
        document.getElementById('send-button').disabled = true;

        // Send the user input to the server
        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_input: userInput }),
        })
        .then(response => response.json())
        .then(data => {
            // Display the AI's response in a highlighted format in the chat box
            const aiResponse = `AI: ${data.result}`;
            addAiMessage(aiResponse);
            // Adding data to session

            const aiChatHistory = JSON.parse(localStorage.getItem('AiresponseHistory')) || [];
            aiChatHistory.push({ type: 'ai', message: aiResponse });
            localStorage.setItem('AiresponseHistory', JSON.stringify(aiChatHistory));

            // Re-enable the "Ask" button
            document.getElementById('send-button').disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            // Re-enable the "Ask" button in case of an error
            document.getElementById('send-button').disabled = false;
        });
        // Clear the input field
        document.getElementById('user-input').value = '';
    }
}

// Attach the sendUserInput function to the Ask button click event
document.getElementById('send-button').addEventListener('click', sendUserInput);

// Allow sending user input by pressing Enter in the input field
document.getElementById('user-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        sendUserInput();
    }
});

// Automatically focus on the user input field when the page loads
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('user-input').focus();
});

document.addEventListener("DOMContentLoaded", function () {
    // Check if the browser supports the Web Speech API
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        const voiceButton = document.getElementById("voice-button");
        const micIcon = document.getElementById("mic-icon");
        const userInput = document.getElementById("user-input");

        let isMicOpen = false; // Flag to track mic state

        // Initially, set the mic icon to closed
        micIcon.classList.remove('fa-microphone');
        micIcon.classList.add('fa-microphone-slash');

        voiceButton.addEventListener("click", function () {
            if (isMicOpen) {
                // Stop listening and change the mic icon to closed
                recognition.stop();
                micIcon.classList.remove('fa-microphone');
                micIcon.classList.add('fa-microphone-slash');
            } else {
                // Start listening and change the mic icon to open
                recognition.start();
                micIcon.classList.remove('fa-microphone-slash');
                micIcon.classList.add('fa-microphone');
            }
            // Toggle the mic state
            isMicOpen = !isMicOpen;
        });

        // Handle recognition result
        recognition.onresult = function (event) {
            const result = event.results[0][0].transcript;
            
            // Update the user input field with the recognized text
            userInput.value = result; // Corrected line
            
            console.log(result)
            // Optional: If you want to stop recognition after setting the value
            recognition.stop();
        };
        // recognition.onerror = function (event) {
        //     console.error('Speech recognition error:', event.error);
            
        //     // Set a timeout to display the error message after 3-5 seconds (3000-5000 milliseconds)
        //     recognitionTimeout = setTimeout(function () {
        //         alert("Voice not recognized. Please try again.");
        //     }, Math.floor(Math.random() * 2000) + 3000); // Random delay between 3 and 5 seconds
        // };
    } else {
        // Browser doesn't support Web Speech API, handle accordingly
        alert("Your browser doesn't support voice recognition.");
    }
});



// Read Text
// Function to handle text-to-speech (TTS)

// Function to add an AI message to the chat box with a TTS icon
let currentSpeakingText = null;
function addAiMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const aiMessageElement = document.createElement('div');
    aiMessageElement.classList.add('chat-message', 'ai-message');
    
    aiMessageElement.textContent = message;

    // Create a TTS icon button
    const ttsButton = document.createElement('button');
    ttsButton.classList.add('tts-button');
    ttsButton.innerHTML = '<i class="fas fa-volume-up"></i>';

    function toggleTTS() {
        if (currentSpeakingText === message) {
            // Stop the voice
            stopSpeech();
        } else {
            // Start the voice
            speakText(message);
        }
    }

    ttsButton.addEventListener('click', toggleTTS);
    aiMessageElement.appendChild(ttsButton);
    chatBox.appendChild(aiMessageElement);
    
}


function speakText(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    // Use the default voice
    const voices = synth.getVoices();
    utterance.voice = voices[1];

    currentSpeakingText = text;

     // Speak the text
    synth.speak(utterance);

    utterance.onend = function() {
        currentSpeakingText = null; 
    };
}

function stopSpeech() {
    const synth = window.speechSynthesis;
    synth.cancel();
    currentSpeakingText = null;
}

// Function to retrieve and display chat history from Local Storage
function displayChatHistory() {
    const userChatHistory = JSON.parse(localStorage.getItem('UserQuestionHistory')) || [];
    const aiChatHistory = JSON.parse(localStorage.getItem('AiresponseHistory')) || [];

    // Display user questions
    userChatHistory.forEach(item => {
        if (item.type === 'Que') {
            addUserMessage(item.message);
        }
    });

    // Display AI responses
    aiChatHistory.forEach(item => {
        if (item.type === 'ai') {
            addAiMessage(item.message);
        }
    });
}

// Call the function to display chat history when the page loads
document.addEventListener('DOMContentLoaded', displayChatHistory);