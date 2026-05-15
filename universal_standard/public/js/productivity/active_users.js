(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.active_users = NS.active_users || {});
    let timer = null;
    function render(users) {
        let box = document.querySelector(".us-active-users");
        if (!box) {
            box = document.createElement("div");
            box.className = "us-active-users";
            const target = document.querySelector(".navbar .navbar-collapse, .page-head .page-actions, .navbar");
            if (target) target.prepend(box);
        }
        box.textContent = __("Active") + ": " + users.length;
        box.title = users.map(u => `${u.user} ${u.last_active || ""}`).join("\n");
    }
    function refresh() {
        frappe.call({ method: "universal_standard.productivity.active_users.get_active_users", callback: r => render(r.message || []) });
    }
    mod.init = function (settings) {
        if (timer) return;
        refresh();
        const interval = Math.max(parseInt(settings.active_users_refresh_interval || 120, 10), 60) * 1000;
        timer = setInterval(refresh, interval);
    };
})();
