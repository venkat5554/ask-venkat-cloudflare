const chatForm =
  document.getElementById("chatForm");

const messageInput =
  document.getElementById("messageInput");

const messages =
  document.getElementById("messages");

const welcome =
  document.getElementById("welcome");

const sendBtn =
  document.getElementById("sendBtn");

const newChatBtn =
  document.getElementById("newChatBtn");


let conversationHistory = [];

let isSending = false;


function resizeTextarea() {

  messageInput.style.height =
    "auto";

  messageInput.style.height =
    `${Math.min(
      messageInput.scrollHeight,
      180
    )}px`;
}


function scrollToBottom() {

  window.scrollTo({
    top:
      document.body.scrollHeight,

    behavior:
      "smooth",
  });
}


function addMessage(
  role,
  text,
) {

  welcome.classList.add(
    "hidden"
  );


  const row =
    document.createElement(
      "div"
    );

  row.className =
    `message ${role}`;


  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "bubble";

  bubble.textContent =
    text;


  row.appendChild(
    bubble
  );

  messages.appendChild(
    row
  );


  scrollToBottom();


  return row;
}


function setSending(
  value,
) {

  isSending =
    value;

  sendBtn.disabled =
    value;

  messageInput.disabled =
    value;
}


async function sendMessage(
  rawMessage,
) {

  const message =
    rawMessage.trim();


  if (
    !message
    ||
    isSending
  ) {
    return;
  }


  const historyBeforeRequest =
    conversationHistory.slice(
      -8
    );


  addMessage(
    "user",
    message,
  );


  conversationHistory.push({
    role: "user",
    content: message,
  });


  messageInput.value =
    "";

  resizeTextarea();

  setSending(true);


  const thinkingRow =
    addMessage(
      "assistant",
      "Thinking..."
    );


  try {

    const response =
      await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              message,

              history:
                historyBeforeRequest,
            }),
        }
      );


    let data = {};


    try {

      data =
        await response.json();

    } catch (_) {

      data = {};

    }


    thinkingRow.remove();


    if (!response.ok) {

      throw new Error(
        data.detail
        ||
        "Request failed."
      );

    }


    const answer =
      data.answer
      ||
      "I couldn't generate an answer.";


    addMessage(
      "assistant",
      answer,
    );


    conversationHistory.push({
      role: "assistant",
      content: answer,
    });


    conversationHistory =
      conversationHistory.slice(
        -12
      );

  } catch (error) {

    thinkingRow.remove();


    addMessage(
      "assistant",
      "I hit a temporary problem while answering. Please try again.",
    );


    console.error(
      error
    );

  } finally {

    setSending(false);

    messageInput.focus();

  }
}


chatForm.addEventListener(
  "submit",

  (event) => {

    event.preventDefault();

    sendMessage(
      messageInput.value
    );

  }
);


messageInput.addEventListener(
  "input",

  resizeTextarea
);


messageInput.addEventListener(
  "keydown",

  (event) => {

    if (
      event.key === "Enter"
      &&
      !event.shiftKey
    ) {

      event.preventDefault();

      chatForm.requestSubmit();

    }

  }
);


newChatBtn.addEventListener(
  "click",

  () => {

    conversationHistory = [];

    messages.innerHTML = "";

    welcome.classList.remove(
      "hidden"
    );

    messageInput.value = "";

    resizeTextarea();

    messageInput.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }
);


document
  .querySelectorAll(
    ".suggestion"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",

        () => {

          sendMessage(
            button.textContent
          );

        }
      );

    }
  );


resizeTextarea();

messageInput.focus();