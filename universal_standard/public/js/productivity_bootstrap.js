(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const VERSION = "20260524_2";
    const MODULES = {
        attachment_preview: { flag: "enable_attachment_preview", path: "/assets/universal_standard/js/productivity/attachment_preview.js" },
        file_merge: { flag: "enable_file_merge", path: "/assets/universal_standard/js/productivity/file_merge.js" },
        sidebar_collapsed: { flag: "enable_sidebar_collapsed", path: "/assets/universal_standard/js/productivity/sidebar_collapsed.js" },
        list_unassign: { flag: "enable_list_unassign", path: "/assets/universal_standard/js/productivity/list_unassign.js" },
        language_switcher: { flag: "enable_language_switcher", path: "/assets/universal_standard/js/productivity/language_switcher.js" },
        navbar_tools: { flag: "enable_navbar_tools", path: "/assets/universal_standard/js/productivity/navbar_tools.js" },
        active_users: { flag: "enable_active_users", path: "/assets/universal_standard/js/productivity/active_users.js" },
        internal_alerts: { flag: "enable_internal_alerts", path: "/assets/universal_standard/js/productivity/internal_alerts.js" },
        export_defaults: { flag: "enable_export_defaults", path: "/assets/universal_standard/js/productivity/export_defaults.js" },
        tinymce_optional: { flag: "enable_tinymce_optional", path: "/assets/universal_standard/js/productivity/tinymce_optional.js" },
    };

    function log(settings, ...args) {
        if (settings && settings.enable_debug_logs) console.log("[Universal Productivity]", ...args);
    }

    function call(method, args) {
        return new Promise((resolve, reject) => {
            if (!window.frappe || !frappe.call) return resolve({});
            frappe.call({
                method,
                args: args || {},
                callback: (r) => resolve(r.message || r),
                error: reject,
            });
        });
    }

    function loadScript(path) {
        const src = path + "?v=" + VERSION;
        if (document.querySelector(`script[data-us-productivity="${path}"]`)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = false;
            script.dataset.usProductivity = path;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function cleanupDisabled(settings) {
        Object.keys(MODULES).forEach((moduleName) => {
            const spec = MODULES[moduleName];
            const module = NS[moduleName];
            const shouldRun = Boolean(settings && settings.enable_productivity_tools && settings[spec.flag]);
            if (!shouldRun && module && typeof module.destroy === "function") {
                module.destroy();
            }
        });
    }

    async function init() {
        if (NS.__initializing) return;
        NS.__initializing = true;
        try {
            const settings = await call("universal_standard.productivity.settings.get_productivity_settings");
            NS.settings = settings || {};
            if (!settings || !settings.enable_productivity_tools) {
                cleanupDisabled(settings);
                log(settings, "Productivity tools disabled");
                return;
            }
            cleanupDisabled(settings);
            const enabled = settings.enabled_modules || [];
            for (const moduleName of enabled) {
                const spec = MODULES[moduleName];
                if (!spec || !settings[spec.flag]) continue;
                await loadScript(spec.path);
                const module = NS[moduleName];
                if (module && typeof module.init === "function") {
                    module.init(settings, { call, log });
                }
            }
        } catch (error) {
            console.warn("Universal Standard productivity bootstrap failed", error);
        } finally {
            NS.__initializing = false;
        }
    }

    NS.init = init;
    function schedule() {
        setTimeout(init, 250);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule);
    else schedule();
    if (window.frappe && frappe.router && frappe.router.on) frappe.router.on("change", schedule);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) schedule();
    });
})();
