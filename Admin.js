
    // This is an event button for opening the sidebar
    const MenuBtn = document.getElementById("Menu");
    const Sidebar = document.getElementById("Sidebar");

    MenuBtn.addEventListener("click", function() {
        Sidebar.classList.toggle("active");
    });


    // Close the sidebar on document click 
    document.addEventListener("click", function(event) {
        if (!Sidebar.contains(event.target) && !MenuBtn.contains(event.target)) {
            Sidebar.classList.remove("active");
        }
    });
 