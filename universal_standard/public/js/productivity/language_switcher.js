(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.language_switcher = NS.language_switcher || {});

    const LABELS = {
        ar: { short: "AR", name: "العربية", flagClass: "us-flag-ar" },
        en: { short: "EN", name: "English", flagClass: "us-flag-en" },
    };

    function __(text) {
        return window.__ ? window.__(text) : text;
    }

    function escapeHtml(value) {
        const text = value == null ? "" : String(value);
        if (window.frappe?.utils?.escape_html) return frappe.utils.escape_html(text);
        return text.replace(/[&<>"']/g, (char) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        })[char]);
    }

    function currentLanguage() {
        const boot = frappe.boot || {};
        return String(boot.lang || boot.user?.language || "en").toLowerCase().split("-")[0];
    }

    function allowedLanguages(settings) {
        const raw = String(settings?.language_switcher_languages || "ar,en");
        const values = raw.split(/[\n,]+/).map((value) => value.trim().toLowerCase().split("-")[0]).filter(Boolean);
        return Array.from(new Set(values.length ? values : ["ar", "en"]));
    }

    function labelFor(language) {
        return LABELS[language] || {
            short: language.toUpperCase(),
            name: language.toUpperCase(),
            flagClass: "us-flag-generic",
        };
    }

    function navbarRight() {
        return document.querySelector(".navbar-right, .navbar .navbar-nav.ml-auto, .navbar .navbar-nav.navbar-right");
    }

    function userItem(target) {
        if (!target) return null;
        const user = target.querySelector("#toolbar-user, #navbar-user, .dropdown-navbar-user, .navbar-user");
        return user?.closest("li.nav-item, li.dropdown") || null;
    }

    function insertBeforeUser(target, node) {
        const user = userItem(target);
        if (user) user.insertAdjacentElement("beforebegin", node);
        else if (node.parentElement !== target) target.appendChild(node);
    }

    function render(settings) {
        const target = navbarRight();
        if (!target) return;

        let wrap = target.querySelector(":scope > .us-language-switcher");
        target.querySelectorAll(":scope > .us-language-switcher").forEach((node, index) => {
            if (index > 0) node.remove();
        });
        if (!wrap) {
            wrap = document.createElement("li");
            wrap.className = "nav-item dropdown us-language-switcher";
            wrap.innerHTML = `
                <a class="nav-link dropdown-toggle us-header-language-trigger" href="#" role="button"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="us-language-short"></span>
                </a>
                <div class="dropdown-menu dropdown-menu-right us-language-menu"></div>
            `;
            wrap.addEventListener("click", (event) => {
                const item = event.target.closest("[data-us-lang]");
                if (!item) return;
                event.preventDefault();
                const next = item.dataset.usLang;
                if (!next || next === currentLanguage()) return;
                frappe.call({
                    method: "universal_standard.api.set_language",
                    type: "POST",
                    args: { language: next },
                    callback: () => window.location.reload(),
                });
            });
        }

        const active = labelFor(currentLanguage());
        wrap.querySelector(".us-language-short").textContent = active.short;
        wrap.querySelector(".us-header-language-trigger").setAttribute("aria-label", active.name);
        wrap.querySelector(".us-header-language-trigger").setAttribute("title", active.name);
        wrap.querySelector(".us-language-menu").innerHTML = allowedLanguages(settings).map((language) => {
            const item = labelFor(language);
            const selected = language === currentLanguage() ? " active" : "";
            return `<button type="button" class="dropdown-item us-language-item${selected}" data-us-lang="${escapeHtml(language)}">
                <span class="us-language-menu-code us-flag ${escapeHtml(item.flagClass)}" aria-hidden="true"></span>
                <span>${escapeHtml(item.name)}</span>
            </button>`;
        }).join("");

        insertBeforeUser(target, wrap);
    }

    mod.init = function (settings) {
        render(settings || NS.settings || {});
        if (mod.bound) return;
        mod.bound = true;
        $(document).on("toolbar_setup.us_language_switch page-change.us_language_switch", () => {
            setTimeout(() => render(NS.settings || {}), 100);
        });
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-language-switcher").forEach((node) => node.remove());
        if (mod.bound) {
            $(document).off(".us_language_switch");
            mod.bound = false;
        }
    };
})();
