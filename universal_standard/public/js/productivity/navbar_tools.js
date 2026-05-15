(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.navbar_tools = NS.navbar_tools || {});
    function ensure() {
        if (document.querySelector(".us-navbar-tools")) return;
        const wrap = document.createElement("div");
        wrap.className = "us-navbar-tools";
        wrap.innerHTML = `<button type="button" class="btn btn-xs btn-default" data-action="settings">${__("Settings")}</button><button type="button" class="btn btn-xs btn-default" data-action="refresh">${__("Refresh")}</button>`;
        wrap.addEventListener("click", e => {
            const action = e.target && e.target.dataset.action;
            if (action === "settings") frappe.set_route("Form", "Universal Standard Settings");
            if (action === "refresh") window.location.reload();
        });
        const target = document.querySelector(".navbar .navbar-collapse, .page-head .page-actions, .navbar");
        if (target) target.prepend(wrap);
    }
    mod.init = function () { ensure(); $(document).on("toolbar_setup page-change", () => setTimeout(ensure, 300)); };
})();
