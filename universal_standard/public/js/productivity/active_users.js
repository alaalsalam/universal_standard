(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.active_users = NS.active_users || {});
    let timer = null;

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

    function navbarTarget() {
        const nav = document.querySelector(".navbar");
        const target = nav && (nav.querySelector(".navbar-right") || nav.querySelector(".navbar-nav.navbar-right") || nav.querySelector(".navbar-collapse"));
        if (target) target.classList.add("us-productivity-navbar-target");
        return target || nav || document.querySelector(".page-head .page-actions");
    }

    function insertInHeader(box) {
        const target = navbarTarget();
        if (!target) return;
        const avatar = target.querySelector(".avatar, .avatar-frame, .navbar-user, .dropdown-avatar");
        const account = target.querySelector(".us-header-account-slot") || (avatar && avatar.closest("li,.dropdown,.nav-item,.navbar-item"));
        if (account && account.parentElement === target) {
            if (account.previousElementSibling !== box) target.insertBefore(box, account);
        } else if (box.parentElement !== target) {
            target.appendChild(box);
        }
    }

    function render(users) {
        const list = Array.isArray(users) ? users : [];
        let box = document.querySelector(".us-active-users");
        if (!box) {
            box = document.createElement("div");
            box.className = "us-active-users dropdown";
            box.innerHTML = `
                <button type="button" class="us-active-users-trigger" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="us-active-users-dot" aria-hidden="true"></span>
                    <span class="us-active-users-count">0</span>
                </button>
                <div class="dropdown-menu us-active-users-menu"></div>
            `;
        }
        insertInHeader(box);
        const count = box.querySelector(".us-active-users-count");
        const menu = box.querySelector(".us-active-users-menu");
        const trigger = box.querySelector(".us-active-users-trigger");
        if (count) count.textContent = String(list.length);
        if (trigger) trigger.title = __("Active Users");
        if (menu) {
            menu.innerHTML = list.length
                ? list.slice(0, 8).map((u) => `<div class="us-active-users-row"><span>${escapeHtml(u.full_name || u.user)}</span><small>${escapeHtml(u.last_active || "")}</small></div>`).join("")
                : `<div class="us-active-users-empty">${escapeHtml(__("No active users"))}</div>`;
        }
    }

    function refresh() {
        frappe.call({
            method: "universal_standard.productivity.active_users.get_active_users",
            callback: (r) => render(r.message || []),
        });
    }

    mod.init = function (settings) {
        refresh();
        if (timer) return;
        const interval = Math.max(parseInt(settings.active_users_refresh_interval || 120, 10), 60) * 1000;
        timer = setInterval(refresh, interval);
    };

    mod.destroy = function () {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        document.querySelectorAll(".us-active-users").forEach((node) => node.remove());
    };
})();
