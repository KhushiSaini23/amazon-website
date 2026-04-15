const EMAIL_KEY = "amazon_clone_auth_email";

const emailForm = document.getElementById("emailForm");
const passwordForm = document.getElementById("passwordForm");

if (emailForm) {
    emailForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const emailError = document.getElementById("emailError");
        const value = emailInput.value.trim();

        if (!value) {
            emailError.style.display = "block";
            emailInput.focus();
            return;
        }

        localStorage.setItem(EMAIL_KEY, value);
        window.location.href = "password.html";
    });
}

if (passwordForm) {
    const savedEmail = localStorage.getItem(EMAIL_KEY);
    const savedEmailNode = document.getElementById("savedEmail");

    if (!savedEmail) {
        window.location.href = "index.html";
    } else if (savedEmailNode) {
        savedEmailNode.textContent = savedEmail;
    }

    passwordForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const passwordInput = document.getElementById("password");
        const passwordError = document.getElementById("passwordError");

        if (!passwordInput.value.trim()) {
            passwordError.style.display = "block";
            passwordInput.focus();
            return;
        }

        window.location.href = "clone.html";
    });
}
