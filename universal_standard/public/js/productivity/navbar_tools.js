(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.navbar_tools = NS.navbar_tools || {});

    function currentLanguage() {
        const boot = frappe.boot || {};
        const user = boot.user || {};
        return String(boot.lang || user.language || "en").toUpperCase();
    }

    function mountTarget() {
        return document.querySelector(".navbar .navbar-collapse") || document.querySelector(".navbar") || document.querySelector(".page-head .page-actions");
    }

    function ensure() {
        document.querySelectorAll(".us-navbar-tools").forEach((node, index) => { if (index > 0) node.remove(); });
        let wrap = document.querySelector(".us-navbar-tools");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "us-navbar-tools dropdown";
            wrap.innerHTML = `
                <button type="button" class="us-chip-button us-tools-trigger" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${__("Quick Tools")}">
                    <span class="us-chip-icon" aria-hidden="true">⚙</span>
                    <span class="us-chip-text">${__("Tools")}</span>
                    <span class="us-chip-caret" aria-hidden="true">⌄</span>
                </button>
                <div class="dropdown-menu us-tools-menu">
                    <button type="button" class="dropdown-item" data-action="settings">${__("Universal Standard Settings")}</button>
                    <button type="button" class="dropdown-item" data-action="reload">${__("Reload Desk")}</button>
                    <div class="dropdown-divider"></div>
                    <span class="dropdown-item-text us-current-language"></span>
                </div>
            `;
            wrap.addEventListener("click", (event) => {
                const actionNode = event.target.closest("[data-action]");
                const action = actionNode && actionNode.dataset.action;
                if (action === "settings") frappe.set_route("Form", "Universal Standard Settings", "Universal Standard Settings");
                if (action === "reload") window.location.reload();
            });
        }
        const langText = wrap.querySelector(".us-current-language");
        if (langText) langText.textContent = `${__("Current Language")}: ${currentLanguage()}`;
        const target = mountTarget();
        if (target && !wrap.parentElement) target.prepend(wrap);
    }

    mod.init = function () {
        ensure();
        if (!mod.bound) {
            mod.bound = true;
            $(document).on("toolbar_setup.us_navbar_tools page-change.us_navbar_tools", () => setTimeout(ensure, 250));
        }
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-navbar-tools").forEach((node) => node.remove());
        if (mod.bound) {
            $(document).off(".us_navbar_tools");
            mod.bound = false;
        }
    };
})();
