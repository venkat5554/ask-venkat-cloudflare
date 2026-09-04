const chatForm =
  document.getElementById("chatForm");

const messageInput =
  document.getElementById("messageInput");

const chat =
  document.getElementById("chat");

const sendBtn =
  document.getElementById("sendBtn");

const newChatBtn =
  document.getElementById("newChatBtn");

const suggestionButtons =
  document.querySelectorAll(
    ".suggestion-btn"
  );

const menuToggle =
  document.getElementById("menuToggle");

const navLinks =
  document.getElementById("navLinks");


let conversationHistory = [];

let isSending = false;


/* ==========================================
   TEXTAREA AUTO RESIZE
=========================================== */

function resizeTextarea() {

  messageInput.style.height =
    "auto";

  messageInput.style.height =
    `${Math.min(
      messageInput.scrollHeight,
      170
    )}px`;
}


/* ==========================================
   SCROLL TO LATEST MESSAGE
=========================================== */

function scrollToMessage(
  element
) {

  element.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}


/* ==========================================
   CREATE MESSAGE
=========================================== */

function addMessage(
  role,
  text
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    role === "assistant"
      ? "message assistant-message"
      : "message user-message";


  const label =
    document.createElement(
      "div"
    );

  label.className =
    "message-label";

  label.textContent =
    role === "assistant"
      ? "Venkat AI"
      : "You";


  const content =
    document.createElement(
      "div"
    );

  content.className =
    "message-content";


  const paragraph =
    document.createElement(
      "p"
    );

  paragraph.textContent =
    text;


  content.appendChild(
    paragraph
  );

  row.appendChild(
    label
  );

  row.appendChild(
    content
  );

  chat.appendChild(
    row
  );


  scrollToMessage(
    row
  );


  return row;
}


/* ==========================================
   SENDING STATE
=========================================== */

function setSending(
  value
) {

  isSending =
    value;

  sendBtn.disabled =
    value;

  messageInput.disabled =
    value;


  if (value) {

    sendBtn.setAttribute(
      "aria-busy",
      "true"
    );

  } else {

    sendBtn.removeAttribute(
      "aria-busy"
    );

  }
}


/* ==========================================
   SEND MESSAGE
=========================================== */

async function sendMessage(
  rawMessage
) {

  const message =
    rawMessage.trim();


  if (
    !message ||
    isSending
  ) {
    return;
  }


  const historyBeforeRequest =
    conversationHistory.slice(
      -8
    );


  /* Add user message */

  addMessage(
    "user",
    message
  );


  conversationHistory.push({
    role: "user",
    content: message,
  });


  /* Clear input */

  messageInput.value =
    "";

  resizeTextarea();


  /* Lock composer */

  setSending(true);


  /* Thinking state */

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


    /* Remove thinking */

    thinkingRow.remove();


    if (!response.ok) {

      throw new Error(
        data.detail ||
        "Request failed."
      );

    }


    const answer =
      data.answer ||
      "I couldn't generate an answer.";


    /* Add AI response */

    addMessage(
      "assistant",
      answer
    );


    conversationHistory.push({
      role: "assistant",
      content: answer,
    });


    /* Limit local history */

    conversationHistory =
      conversationHistory.slice(
        -12
      );


  } catch (error) {

    thinkingRow.remove();


    addMessage(
      "assistant",
      "I hit a temporary problem while answering. Please try again."
    );


    console.error(
      "Chat request failed:",
      error
    );


  } finally {

    setSending(false);

    messageInput.focus();

  }
}


/* ==========================================
   FORM SUBMIT
=========================================== */

chatForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    sendMessage(
      messageInput.value
    );

  }
);


/* ==========================================
   TEXTAREA INPUT
=========================================== */

messageInput.addEventListener(
  "input",
  resizeTextarea
);


/* ==========================================
   ENTER TO SEND
   SHIFT + ENTER = NEW LINE
=========================================== */

messageInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      chatForm.requestSubmit();

    }

  }
);


/* ==========================================
   SUGGESTED QUESTIONS
=========================================== */

suggestionButtons.forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const question =
          button.dataset.question ||
          button.textContent.trim();


        /*
         Put the suggested question
         into the composer instead of
         immediately sending it.

         This gives the visitor a chance
         to edit the question.
        */

        messageInput.value =
          question;

        resizeTextarea();

        messageInput.focus();

      }
    );

  }
);


/* ==========================================
   NEW CHAT
=========================================== */

newChatBtn.addEventListener(
  "click",
  () => {

    conversationHistory =
      [];


    chat.innerHTML = `
      <div class="message assistant-message">

        <div class="message-label">
          Venkat AI
        </div>

        <div class="message-content">

          <p>
            Hi. I can answer questions about Venkat’s
            professional experience, skills, education,
            technologies, and work.
          </p>

          <p>
            Ask a question above or choose one of the suggestions.
          </p>

        </div>

      </div>
    `;


    messageInput.value =
      "";

    resizeTextarea();

    messageInput.focus();


    document
      .querySelector(
        ".ask-section"
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  }
);


/* ==========================================
   MOBILE NAVIGATION
=========================================== */

function openMenu() {

  if (
    !menuToggle ||
    !navLinks
  ) {
    return;
  }


  navLinks.classList.add(
    "open"
  );

  menuToggle.classList.add(
    "active"
  );

  menuToggle.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.classList.add(
    "menu-open"
  );
}


function closeMenu() {

  if (
    !menuToggle ||
    !navLinks
  ) {
    return;
  }


  navLinks.classList.remove(
    "open"
  );

  menuToggle.classList.remove(
    "active"
  );

  menuToggle.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.classList.remove(
    "menu-open"
  );
}


function toggleMenu() {

  if (
    navLinks?.classList.contains(
      "open"
    )
  ) {

    closeMenu();

  } else {

    openMenu();

  }
}


if (
  menuToggle &&
  navLinks
) {

  menuToggle.addEventListener(
    "click",
    toggleMenu
  );


  navLinks
    .querySelectorAll("a")
    .forEach(
      (link) => {

        link.addEventListener(
          "click",
          closeMenu
        );

      }
    );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        closeMenu();

      }

    }
  );


  window.addEventListener(
    "resize",
    () => {

      if (
        window.innerWidth > 700
      ) {

        closeMenu();

      }

    }
  );

}


/* ==========================================
   INITIAL STATE
=========================================== */

resizeTextarea();

messageInput.focus();