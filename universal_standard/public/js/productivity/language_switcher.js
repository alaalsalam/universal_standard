(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.language_switcher = NS.language_switcher || {});
    function label() { const lang = (frappe.boot.lang || (frappe.boot.user && frappe.boot.user.language) || "en").toLowerCase(); return lang === "ar" ? "EN" : "AR"; }
    function ensure() {
        document.querySelectorAll(".us-language-switch").forEach((n, i) => { if (i > 0) n.remove(); });
        let btn = document.querySelector(".us-language-switch");
        if (!btn) {
            btn = document.createElement("button");
            btn.type = "button";
            btn.className = "us-language-switch us-productivity-navbar-btn";
            btn.addEventListener("click", () => {
                frappe.call({ method: "universal_standard.api.toggle_language", type: "POST", callback: () => window.location.reload() });
            });
        }
        btn.textContent = label();
        const target = document.querySelector(".navbar .navbar-collapse, .page-head .page-actions, .navbar");
        if (target && !btn.parentElement) target.prepend(btn);
    }
    mod.init = function () { ensure(); $(document).on("toolbar_setup page-change", () => setTimeout(ensure, 300)); };
})();
