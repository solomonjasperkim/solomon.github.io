document.addEventListener("DOMContentLoaded", function() {
    const projectsLink = document.getElementById("projects-link");
    const infoLink = document.getElementById("info-link");
    const contactLink = document.getElementById("contact-link");

    const projectPanel = document.getElementById("project-panel");
    const infoPanel = document.getElementById("info-panel");
    const contactPanel = document.getElementById("contact-panel");

    const closeProjectPanel = document.getElementById("close-project-panel");
    const closeInfoPanel = document.getElementById("close-info-panel");
    const closeContactPanel = document.getElementById("close-contact-panel");

    const bornText = document.getElementById("born-text");
    const engineerText = document.getElementById("engineer-text");

    function closeAllPanels() {
        projectPanel.style.display = "none";
        infoPanel.style.display = "none";
        contactPanel.style.display = "none";
    }

    function showPanel(panel) {
        bornText.classList.add("crumble");
        engineerText.classList.add("crumble");
        closeAllPanels();
        panel.style.display = "block";
        setTimeout(() => {
            panel.style.opacity = 1;
        }, 167);
    }

    function hidePanel(panel) {
        panel.style.display = "none";
        bornText.classList.remove("crumble");
        engineerText.classList.remove("crumble");
    }

    projectsLink.addEventListener("click", function(event) {
        event.preventDefault();
        showPanel(projectPanel);
    });

    infoLink.addEventListener("click", function(event) {
        event.preventDefault();
        showPanel(infoPanel);
    });

    contactLink.addEventListener("click", function(event) {
        event.preventDefault();
        showPanel(contactPanel);
    });

    closeProjectPanel.addEventListener("click", function() {
        hidePanel(projectPanel);
    });

    closeInfoPanel.addEventListener("click", function() {
        hidePanel(infoPanel);
    });

    closeContactPanel.addEventListener("click", function() {
        hidePanel(contactPanel);
    });

    document.addEventListener("click", function(event) {
        if (!projectPanel.contains(event.target) && !infoPanel.contains(event.target) && !contactPanel.contains(event.target) &&
            !projectsLink.contains(event.target) && !infoLink.contains(event.target) && !contactLink.contains(event.target)) {
            closeAllPanels();
            bornText.classList.remove("crumble");
            engineerText.classList.remove("crumble");
        }
    });
});