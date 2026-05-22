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
        if (window.frappe && frappe.utils && frappe.utils.escape_html) return frappe.utils.escape_html(text);
        return text.replace(/[&<>"']/g, function (char) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
        });
    }

    function currentLanguage() {
        const boot = frappe.boot || {};
        const user = boot.user || {};
        return String(boot.lang || user.language || "en").toLowerCase().split("-")[0];
    }

    function allowedLanguages(settings) {
        const raw = String((settings && settings.language_switcher_languages) || "ar,en");
        const values = raw.split(/[\n,]+/).map((lang) => lang.trim().toLowerCase().split("-")[0]).filter(Boolean);
        return Array.from(new Set(values.length ? values : ["ar", "en"]));
    }

    function languageLabel(lang) {
        return LABELS[lang] || { short: lang.toUpperCase(), name: lang.toUpperCase(), flagClass: "us-flag-generic" };
    }

    function mountTarget() {
        return (
            document.querySelector(".navbar .navbar-right") ||
            document.querySelector(".navbar .navbar-nav.navbar-right") ||
            document.querySelector(".navbar .navbar-collapse") ||
            document.querySelector(".navbar") ||
            document.querySelector(".page-head .page-actions")
        );
    }

    function insertInHeader(wrap) {
        const target = mountTarget();
        if (!target || wrap.parentElement === target) return;
        const help = target.querySelector(".help-dropdown, [data-label='Help'], .navbar-help");
        if (help && help.parentElement === target) target.insertBefore(wrap, help);
        else target.appendChild(wrap);
    }

    function hideLegacyLanguageControls() {
        const navbar = document.querySelector(".navbar");
        if (!navbar) return;
        navbar.querySelectorAll(".language-toggle, [data-original-title='Switch Language'], [title='Switch Language']").forEach((node) => {
            if (!node.closest(".us-language-switcher")) node.classList.add("us-hidden-legacy-language");
        });
        navbar.querySelectorAll("a, button, span, div").forEach((node) => {
            if (node.closest(".us-language-switcher")) return;
            const text = (node.textContent || "").trim();
            if (text === "العربية" || text === "English") node.classList.add("us-hidden-legacy-language");
        });
    }

    function build(settings) {
        document.querySelectorAll(".us-language-switcher").forEach((node, index) => { if (index > 0) node.remove(); });
        let wrap = document.querySelector(".us-language-switcher");
        if (wrap && !wrap.querySelector(".us-header-language-trigger")) {
            wrap.remove();
            wrap = null;
        }
        const lang = currentLanguage();
        const languages = allowedLanguages(settings);
        const active = languageLabel(lang);

        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "us-language-switcher dropdown";
            wrap.innerHTML = `
                <button type="button" class="us-header-language-trigger" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${escapeHtml(__("Language"))}">
                    <span class="us-language-flag" aria-hidden="true"></span>
                    <span class="us-language-short"></span>
                    <span class="us-language-chevron" aria-hidden="true">⌄</span>
                </button>
                <div class="dropdown-menu us-language-menu"></div>
            `;
            wrap.addEventListener("click", (event) => {
                const item = event.target.closest("[data-us-lang]");
                if (!item) return;
                event.preventDefault();
                const nextLang = item.dataset.usLang;
                if (!nextLang || nextLang === currentLanguage()) return;
                frappe.show_alert({ message: __("Changing language..."), indicator: "blue" });
                frappe.call({
                    method: "universal_standard.api.set_language",
                    type: "POST",
                    args: { language: nextLang },
                    callback() {
                        frappe.show_alert({ message: __("Language updated. Reloading..."), indicator: "green" });
                        setTimeout(() => window.location.reload(), 350);
                    },
                    error() {
                        frappe.msgprint({ title: __("Language"), message: __("Could not change language. Please try again."), indicator: "orange" });
                    },
                });
            });
        }

        const flagNode = wrap.querySelector(".us-language-flag");
        const shortNode = wrap.querySelector(".us-language-short");
        if (!flagNode || !shortNode) {
            wrap.remove();
            return build(settings);
        }
        flagNode.className = "us-language-flag us-flag " + active.flagClass;
        flagNode.textContent = "";
        shortNode.textContent = active.short;
        const menu = wrap.querySelector(".us-language-menu");
        menu.innerHTML = languages.map((item) => {
            const label = languageLabel(item);
            const selected = item === lang ? " is-active" : "";
            return `<button type="button" class="dropdown-item us-language-item${selected}" data-us-lang="${escapeHtml(item)}">
                <span class="us-language-menu-main"><span class="us-language-menu-flag us-flag ${escapeHtml(label.flagClass)}"></span><span>${escapeHtml(label.short)}</span></span>
                <span class="us-language-name">${escapeHtml(label.name)}</span>
            </button>`;
        }).join("");

        insertInHeader(wrap);
        hideLegacyLanguageControls();
    }

    mod.init = function (settings) {
        build(settings || NS.settings || {});
        if (!mod.bound) {
            mod.bound = true;
            $(document).on("toolbar_setup.us_language_switch page-change.us_language_switch", () => setTimeout(() => build(NS.settings || {}), 250));
        }
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-language-switcher").forEach((node) => node.remove());
        if (mod.bound) {
            $(document).off(".us_language_switch");
            mod.bound = false;
        }
    };
})();
