(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.language_switcher = NS.language_switcher || {});

    const LABELS = {
        ar: { short: "AR", name: "العربية" },
        en: { short: "EN", name: "English" },
    };

    function currentLanguage() {
        const boot = frappe.boot || {};
        const user = boot.user || {};
        return String(boot.lang || user.language || "en").toLowerCase();
    }

    function allowedLanguages(settings) {
        const raw = String((settings && settings.language_switcher_languages) || "ar,en");
        return raw.split(/[\n,]+/).map((lang) => lang.trim().toLowerCase()).filter(Boolean);
    }

    function languageLabel(lang) {
        return LABELS[lang] || { short: lang.toUpperCase(), name: lang.toUpperCase() };
    }

    function mountTarget() {
        return document.querySelector(".navbar .navbar-collapse") || document.querySelector(".navbar") || document.querySelector(".page-head .page-actions");
    }

    function build(settings) {
        document.querySelectorAll(".us-language-switcher").forEach((node, index) => { if (index > 0) node.remove(); });
        let wrap = document.querySelector(".us-language-switcher");
        const lang = currentLanguage();
        const languages = allowedLanguages(settings);
        const active = languageLabel(lang);

        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "us-language-switcher dropdown";
            wrap.innerHTML = `
                <button type="button" class="us-chip-button us-language-trigger" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${__("Language")}">
                    <span class="us-chip-icon" aria-hidden="true">◎</span>
                    <span class="us-chip-text"></span>
                    <span class="us-chip-caret" aria-hidden="true">⌄</span>
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

        wrap.querySelector(".us-chip-text").textContent = active.name;
        const menu = wrap.querySelector(".us-language-menu");
        menu.innerHTML = languages.map((item) => {
            const label = languageLabel(item);
            const selected = item === lang ? " is-active" : "";
            return `<button type="button" class="dropdown-item us-language-item${selected}" data-us-lang="${frappe.utils.escape_html(item)}">
                <span>${frappe.utils.escape_html(label.name)}</span><span class="us-language-code">${frappe.utils.escape_html(label.short)}</span>
            </button>`;
        }).join("");

        const target = mountTarget();
        if (target && !wrap.parentElement) target.prepend(wrap);
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
