const mapBtn = document.getElementById("mapBtn");
const menuBtn = document.getElementById("menuBtn");
const cartBtn = document.getElementById("cartBtn");
const orderBtn = document.getElementById("orderBtn");

const mapSection = document.getElementById("mapSection");
const menuSection = document.getElementById("menuSection");
const cartSection = document.getElementById("cartSection");
const orderSection = document.getElementById("orderSection");

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