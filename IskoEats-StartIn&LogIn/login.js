function togglePassword() {
    const password = document.getElementById("password");
    const button = document.querySelector(".show-btn");

    console.log(password);

    if (password.type === "password") {
        password.type = "text";
        button.textContent = "Hide";
    } else {
        password.type = "password";
        button.textContent = "Show";
    }
}