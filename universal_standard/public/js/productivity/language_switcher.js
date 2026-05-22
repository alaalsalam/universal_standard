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

    function navbar() {
        return document.querySelector(".navbar");
    }

    function mountTarget() {
        const nav = navbar();
        return (
            (nav && (nav.querySelector(".navbar-right") || nav.querySelector(".navbar-nav.navbar-right") || nav.querySelector(".navbar-collapse"))) ||
            nav ||
            document.querySelector(".page-head .page-actions")
        );
    }

    function closestCompactElement(node) {
        let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        while (element && element !== document.body) {
            if (element.closest && element.closest(".us-header-productivity-tools, .us-language-switcher")) return null;
            const text = (element.textContent || "").trim();
            if ((text === "العربية" || text === "English") && element.querySelectorAll("*").length <= 4) return element;
            if (element.matches && element.matches("a,button,li,.dropdown,.nav-item,.navbar-item,.btn")) return element;
            element = element.parentElement;
        }
        return null;
    }

    function hideLegacyLanguageControls() {
        const nav = navbar();
        if (!nav) return;
        nav.querySelectorAll(".language-toggle, [data-original-title='Switch Language'], [title='Switch Language'], [aria-label='Switch Language']").forEach((node) => {
            if (!node.closest(".us-header-productivity-tools")) {
                const compact = closestCompactElement(node) || node;
                compact.classList.add("us-hidden-legacy-language");
            }
        });
        const walker = document.createTreeWalker(nav, NodeFilter.SHOW_TEXT);
        const matches = [];
        while (walker.nextNode()) {
            const text = (walker.currentNode.nodeValue || "").trim();
            if (text === "العربية" || text === "English") matches.push(walker.currentNode);
        }
        matches.forEach((textNode) => {
            const compact = closestCompactElement(textNode);
            if (compact) compact.classList.add("us-hidden-legacy-language");
        });
    }

    function headerGroup() {
        const target = mountTarget();
        if (!target) return null;
        let group = target.querySelector(".us-header-productivity-tools");
        if (!group) {
            group = document.createElement("div");
            group.className = "us-header-productivity-tools";
            const help = target.querySelector(".help-dropdown, [data-label='Help'], .navbar-help");
            const user = target.querySelector(".avatar, .avatar-frame, .navbar-user, .dropdown-avatar");
            const userWrap = user && (user.closest("li,.dropdown,.nav-item,.navbar-item") || user.parentElement);
            if (help && help.parentElement === target) help.insertAdjacentElement("afterend", group);
            else if (userWrap && userWrap.parentElement === target) target.insertBefore(group, userWrap);
            else target.appendChild(group);
        }
        return group;
    }

    function build(settings) {
        hideLegacyLanguageControls();
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
                    <span class="us-language-flag us-flag" aria-hidden="true"></span>
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
        const menu = wrap.querySelector(".us-language-menu");
        if (!flagNode || !shortNode || !menu) {
            wrap.remove();
            return build(settings);
        }
        flagNode.className = "us-language-flag us-flag " + active.flagClass;
        flagNode.textContent = "";
        shortNode.textContent = active.short;
        menu.innerHTML = languages.map((item) => {
            const label = languageLabel(item);
            const selected = item === lang ? " is-active" : "";
            return `<button type="button" class="dropdown-item us-language-item${selected}" data-us-lang="${escapeHtml(item)}">
                <span class="us-language-menu-main"><span class="us-language-menu-flag us-flag ${escapeHtml(label.flagClass)}"></span><span>${escapeHtml(label.short)}</span></span>
                <span class="us-language-name">${escapeHtml(label.name)}</span>
            </button>`;
        }).join("");

        const group = headerGroup();
        if (group && wrap.parentElement !== group) group.prepend(wrap);
        hideLegacyLanguageControls();
    }

    function observe(settings) {
        if (mod.observer) return;
        mod.observer = new MutationObserver(() => {
            clearTimeout(mod.observeTimer);
            mod.observeTimer = setTimeout(() => {
                hideLegacyLanguageControls();
                build(settings || NS.settings || {});
            }, 120);
        });
        if (document.body) mod.observer.observe(document.body, { childList: true, subtree: true });
    }

    mod.init = function (settings) {
        build(settings || NS.settings || {});
        observe(settings || NS.settings || {});
        if (!mod.bound) {
            mod.bound = true;
            $(document).on("toolbar_setup.us_language_switch page-change.us_language_switch", () => setTimeout(() => build(NS.settings || {}), 250));
        }
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-language-switcher").forEach((node) => node.remove());
        document.querySelectorAll(".us-hidden-legacy-language").forEach((node) => node.classList.remove("us-hidden-legacy-language"));
        if (mod.observer) {
            mod.observer.disconnect();
            mod.observer = null;
        }
        if (mod.bound) {
            $(document).off(".us_language_switch");
            mod.bound = false;
        }
    };
})();
