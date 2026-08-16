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


    function ensureNavbarPolishStyle() {
        if (document.getElementById("us-productivity-navbar-polish-style")) return;
        const style = document.createElement("style");
        style.id = "us-productivity-navbar-polish-style";
        style.textContent = `
            html body .navbar .us-productivity-navbar-target { display:flex !important; align-items:center !important; flex-direction:row !important; gap:0 !important; }
            html body .navbar .us-header-account-slot { order:901 !important; display:inline-flex !important; align-items:center !important; }
            html body .navbar .us-language-switcher { order:902 !important; display:inline-flex !important; align-items:center !important; flex:0 0 auto !important; height:38px !important; margin-inline:7px 3px !important; padding:0 !important; border:0 !important; background:transparent !important; box-shadow:none !important; }
            html body .navbar .us-language-switcher .us-header-language-trigger { width:auto !important; min-width:76px !important; max-width:92px !important; height:36px !important; min-height:36px !important; max-height:36px !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; gap:6px !important; padding:0 4px !important; margin:0 !important; border:0 !important; border-radius:9px !important; background:transparent !important; box-shadow:none !important; color:var(--text-color,#111827) !important; font-size:15px !important; font-weight:760 !important; line-height:1 !important; letter-spacing:0 !important; cursor:pointer !important; }
            html body .navbar .us-language-switcher .us-header-language-trigger:hover,
            html body .navbar .us-language-switcher .us-header-language-trigger:focus-visible,
            html body .navbar .us-navbar-tools .us-header-icon-button:hover,
            html body .navbar .us-navbar-tools .us-header-icon-button:focus-visible { background:var(--control-bg,rgba(15,23,42,.06)) !important; box-shadow:none !important; outline:0 !important; transform:none !important; }
            html body .navbar .us-language-switcher .us-language-mark { width:31px !important; min-width:31px !important; height:31px !important; min-height:31px !important; border-radius:999px !important; box-shadow:inset 0 0 0 1px rgba(15,23,42,.12) !important; }
            html body .navbar .us-language-switcher .us-language-short { min-width:21px !important; display:inline-block !important; text-align:center !important; line-height:1 !important; }
            html body .navbar .us-language-switcher .us-language-chevron { width:12px !important; min-width:12px !important; color:var(--text-muted,#4b5563) !important; font-size:15px !important; line-height:1 !important; margin:0 !important; transform:translateY(-1px) !important; }
            html body .navbar .us-navbar-tools { order:903 !important; display:inline-flex !important; align-items:center !important; flex:0 0 auto !important; height:38px !important; margin-inline:0 6px !important; padding:0 !important; border:0 !important; background:transparent !important; box-shadow:none !important; }
            html body .navbar .us-navbar-tools .us-header-icon-button { width:36px !important; min-width:36px !important; height:36px !important; min-height:36px !important; display:inline-flex !important; align-items:center !important; justify-content:center !important; padding:0 !important; margin:0 !important; border:0 !important; border-radius:9px !important; background:transparent !important; box-shadow:none !important; color:var(--text-color,#111827) !important; cursor:pointer !important; }
            html body .navbar .us-navbar-tools .us-header-icon-button svg { width:20px !important; height:20px !important; display:block !important; fill:currentColor !important; }
            html body .navbar .us-hidden-legacy-language,
            html body .navbar .language-toggle:not(.us-header-language-trigger),
            html body .navbar .language-switcher:not(.us-language-switcher) { display:none !important; visibility:hidden !important; width:0 !important; min-width:0 !important; height:0 !important; min-height:0 !important; padding:0 !important; margin:0 !important; overflow:hidden !important; }
        `;
        document.head.appendChild(style);
    }

    function applyInlinePolish(wrap) {
        if (!wrap) return;
        wrap.style.cssText = "order:902;display:inline-flex;align-items:center;flex:0 0 auto;height:38px;margin-inline:7px 3px;padding:0;border:0;background:transparent;box-shadow:none;";
        const trigger = wrap.querySelector(".us-header-language-trigger");
        if (trigger) trigger.style.cssText = "width:auto;min-width:76px;max-width:92px;height:36px;min-height:36px;max-height:36px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 4px;margin:0;border:0;border-radius:9px;background:transparent;box-shadow:none;color:var(--text-color,#111827);font-size:15px;font-weight:760;line-height:1;letter-spacing:0;cursor:pointer;";
        const mark = wrap.querySelector(".us-language-mark");
        if (mark) mark.style.cssText = "width:31px;min-width:31px;height:31px;min-height:31px;border-radius:999px;";
        const short = wrap.querySelector(".us-language-short");
        if (short) short.style.cssText = "min-width:21px;display:inline-block;text-align:center;line-height:1;";
        const chevron = wrap.querySelector(".us-language-chevron");
        if (chevron) chevron.style.cssText = "width:12px;min-width:12px;margin:0;line-height:1;font-size:15px;transform:translateY(-1px);";
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
        const target = (
            (nav && (nav.querySelector(".navbar-right") || nav.querySelector(".navbar-nav.navbar-right") || nav.querySelector(".navbar-collapse"))) ||
            nav ||
            document.querySelector(".page-head .page-actions")
        );
        if (target) target.classList.add("us-productivity-navbar-target");
        return target;
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

    function insertAfter(reference, node) {
        if (!reference || !reference.parentElement) return false;
        if (reference.nextElementSibling !== node) reference.insertAdjacentElement("afterend", node);
        return true;
    }

    function insertInHeader(wrap) {
        const target = mountTarget();
        if (!target) return;
        const user = target.querySelector(".avatar, .avatar-frame, .navbar-user, .dropdown-avatar");
        const userWrap = user && (user.closest("li,.dropdown,.nav-item,.navbar-item") || user.parentElement);
        if (userWrap && userWrap.parentElement === target) {
            userWrap.classList.add("us-header-account-slot");
            insertAfter(userWrap, wrap);
        } else if (wrap.parentElement !== target) {
            target.appendChild(wrap);
        }
    }

    function build(settings) {
        ensureNavbarPolishStyle();
        hideLegacyLanguageControls();
        document.querySelectorAll(".us-header-productivity-tools").forEach((node) => node.remove());
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
                    <span class="us-language-mark us-flag" aria-hidden="true"></span>
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

        const markNode = wrap.querySelector(".us-language-mark");
        const shortNode = wrap.querySelector(".us-language-short");
        const menu = wrap.querySelector(".us-language-menu");
        if (!markNode || !shortNode || !menu) {
            wrap.remove();
            return build(settings);
        }
        markNode.className = "us-language-mark us-flag " + active.flagClass;
        shortNode.textContent = active.short;
        wrap.querySelector(".us-header-language-trigger").setAttribute("aria-label", active.name);
        menu.innerHTML = languages.map((item) => {
            const label = languageLabel(item);
            const selected = item === lang ? " is-active" : "";
            return `<button type="button" class="dropdown-item us-language-item${selected}" data-us-lang="${escapeHtml(item)}">
                <span class="us-language-menu-main"><span class="us-language-menu-code us-flag ${escapeHtml(label.flagClass)}"></span><span>${escapeHtml(label.short)}</span><span>${escapeHtml(label.name)}</span></span>
            </button>`;
        }).join("");

        insertInHeader(wrap);
        applyInlinePolish(wrap);
        hideLegacyLanguageControls();
        if (NS.navbar_tools && typeof NS.navbar_tools.init === "function") {
            setTimeout(() => NS.navbar_tools.init(NS.settings || {}), 0);
        }
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
