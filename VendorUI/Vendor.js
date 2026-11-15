const mapBtn = document.getElementById("VerifyBtn");
const menuBtn = document.getElementById("ListBtn");
const cartBtn = document.getElementById("OrderBtn");
const orderBtn = document.getElementById("InfoBtn");

const mapSection = document.getElementById("VerifySection");
const menuSection = document.getElementById("ListSection");
const cartSection = document.getElementById("OrderSection");
const orderSection = document.getElementById("InfoSection");

function hideAll() {
    mapSection.style.display = "none";
    menuSection.style.display = "none";
    cartSection.style.display = "none";
    orderSection.style.display = "none";
}

mapBtn.addEventListener("click", () => {
    hideAll();
    mapSection.style.display = "block";
});

menuBtn.addEventListener("click", () => {
    hideAll();
    menuSection.style.display = "block";
});

cartBtn.addEventListener("click", () => {
    hideAll();
    cartSection.style.display = "block";
});

orderBtn.addEventListener("click", () => {
    hideAll();
    orderSection.style.display = "block";
});