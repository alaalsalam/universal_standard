(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.internal_alerts = NS.internal_alerts || {});
    mod.init = function () {
        if (mod.initialized) return;
        mod.initialized = true;
        frappe.call({ method: "universal_standard.productivity.alerts.get_internal_alerts", callback: r => {
            (r.message || []).forEach(alert => {
                const key = "us_alert_seen_" + alert.name;
                if (alert.show_once && localStorage.getItem(key)) return;
                frappe.msgprint({ title: alert.title, message: alert.message, indicator: (alert.alert_type || "Info").toLowerCase() });
                if (alert.show_once) localStorage.setItem(key, "1");
            });
        }});
    };

    mod.destroy = function () {
        mod.initialized = false;
    };
})();
