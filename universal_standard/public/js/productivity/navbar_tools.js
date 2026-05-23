(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.navbar_tools = NS.navbar_tools || {});

    function removeFullscreenControls() {
        document.querySelectorAll(".us-navbar-tools, .us-fullscreen-toggle, .us-header-productivity-tools").forEach((node) => node.remove());
    }

    mod.init = function () {
        removeFullscreenControls();
    };

    mod.destroy = function () {
        removeFullscreenControls();
    };
})();
