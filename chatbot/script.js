const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");


const API_KEY = "AIzaSyBRNvCUZXpoWhlUduxD9MfmNuWy8x9SJ18";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;


const chatHistory = [];

const initialInputHeight = messageInput.scrollHeight;

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  chatHistory.push({ 
    role:"user",
    parts: [{ text: userData.message || "" }, ...fileParts] });
  const fileParts = userData.file.data ? [{ inline_data: userData.file }] : [];

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: chatHistory
    })
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const apiResponseText = data.candidates[0]?.content?.parts[0]?.text?.trim() || "Yanıt alınamadı.";

    messageElement.innerText = apiResponseText;

    chatHistory.push({ 
      role:"model",
      parts: [{ text: apiResponseText }]

  } catch (error) {
    console.log(error);
    messageElement.innerText = error.message;
    messageElement.style.color = "red";
  } finally {
    userData.file = {}; // Dosya verisini sıfırla
    incomingMessageDiv.classList.remove("thinking");
  }
};

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null
  }
};

const handleOutgoingMessage = (e) => {
  e.preventDefault();

  userData.message = messageInput.value.trim();
  if (!userData.message) return; // Boş mesaj engellemesi

  messageInput.value = "";
  fileUploadWrapper.classList.remove("file-uploaded");
  messageInput.dispatchEvent(new Event ("input"));

  const messageContent = `<div class="message-text">${userData.message}</div>`;
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");

  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    const botMessageContent = `
      <div class="message-text">
        <div class="thinking-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
      ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}
    `;

    const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");

    chatBody.appendChild(incomingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    generateBotResponse(incomingMessageDiv);
  }, 600);
};

messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
    handleOutgoingMessage(e);
  }
});





//Adjust input field height dynamically
messageInput.addEventListener("input", () =>{
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
})





// Dosya seçimi ve yükleme işlemi
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    userData.file = {
      data: base64String,
      mime_type: file.type
    };

    fileInput.value = ""; // Dosya input'unu sıfırla
  };

  reader.readAsDataURL(file);
});

// Dosya yükleme iptali
fileCancelButton.addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-uploaded");
  fileUploadWrapper.querySelector("img").src = "";
});



//initialize emoji picker

const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutSide: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  }
});

document.querySelector(".chat-form").appendChild(picker);





const emojiPickerContainer = document.querySelector(".chat-form");
emojiPickerContainer.appendChild(picker);




sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

chatbotToggler.addEventListener("click", (e) => document.body.classList.toggle("show-chatbot"));

closeChatbot.addEventListener("click", ()=> document.body.classList.remove("show-chatbot"));
