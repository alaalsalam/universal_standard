(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.language_switcher = NS.language_switcher || {});

    const LABELS = {
        ar: { short: "AR", name: "العربية" },
        en: { short: "EN", name: "English" },
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
        return LABELS[lang] || { short: lang.toUpperCase(), name: lang.toUpperCase() };
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

    function compactElement(node) {
        let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        while (element && element !== document.body) {
            if (element.closest && element.closest(".us-language-switcher")) return null;
            const text = (element.textContent || "").trim();
            if ((text === "العربية" || text === "English") && element.querySelectorAll("*").length <= 5) return element;
            if (element.matches && element.matches("a,button,li,.dropdown,.nav-item,.navbar-item,.btn")) return element;
            element = element.parentElement;
        }
        return null;
    }

    function hideLegacyLanguageControls() {
        const nav = navbar();
        if (!nav) return;
        nav.querySelectorAll(".language-toggle, [data-original-title='Switch Language'], [title='Switch Language'], [aria-label='Switch Language']").forEach((node) => {
            if (!node.closest(".us-language-switcher")) (compactElement(node) || node).classList.add("us-hidden-legacy-language");
        });
        const walker = document.createTreeWalker(nav, NodeFilter.SHOW_TEXT);
        const matches = [];
        while (walker.nextNode()) {
            const text = (walker.currentNode.nodeValue || "").trim();
            if (text === "العربية" || text === "English") matches.push(walker.currentNode);
        }
        matches.forEach((textNode) => {
            const element = compactElement(textNode);
            if (element) element.classList.add("us-hidden-legacy-language");
        });
    }

    function findHelpElement(target) {
        return (
            target.querySelector(".help-dropdown") ||
            target.querySelector("[data-label='Help']") ||
            target.querySelector(".navbar-help") ||
            Array.from(target.querySelectorAll("a,button,li,.dropdown,.nav-item")).find((node) => (node.textContent || "").trim().startsWith("Help"))
        );
    }

    function insertInHeader(wrap) {
        const target = mountTarget();
        if (!target) return;
        const help = findHelpElement(target);
        const user = target.querySelector(".avatar, .avatar-frame, .navbar-user, .dropdown-avatar");
        const userWrap = user && (user.closest("li,.dropdown,.nav-item,.navbar-item") || user.parentElement);
        if (help && help.parentElement === target) {
            if (wrap.previousElementSibling !== help) help.insertAdjacentElement("afterend", wrap);
        } else if (userWrap && userWrap.parentElement === target) {
            if (wrap.nextElementSibling !== userWrap) target.insertBefore(wrap, userWrap);
        } else if (wrap.parentElement !== target) {
            target.appendChild(wrap);
        }
    }

    function build(settings) {
        hideLegacyLanguageControls();
        document.querySelectorAll(".us-header-productivity-tools, .us-navbar-tools").forEach((node) => node.remove());
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
                    <span class="us-language-short"></span>
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

        const shortNode = wrap.querySelector(".us-language-short");
        const menu = wrap.querySelector(".us-language-menu");
        if (!shortNode || !menu) {
            wrap.remove();
            return build(settings);
        }
        shortNode.textContent = active.short;
        wrap.querySelector(".us-header-language-trigger").setAttribute("aria-label", active.name);
        menu.innerHTML = languages.map((item) => {
            const label = languageLabel(item);
            const selected = item === lang ? " is-active" : "";
            return `<button type="button" class="dropdown-item us-language-item${selected}" data-us-lang="${escapeHtml(item)}">
                <span class="us-language-menu-main"><span class="us-language-menu-code">${escapeHtml(label.short)}</span><span>${escapeHtml(label.name)}</span></span>
            </button>`;
        }).join("");

        insertInHeader(wrap);
        hideLegacyLanguageControls();
    }

    function observe(settings) {
        if (mod.observer) return;
        mod.observer = new MutationObserver(() => {
            clearTimeout(mod.observeTimer);
            mod.observeTimer = setTimeout(() => build(settings || NS.settings || {}), 140);
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
