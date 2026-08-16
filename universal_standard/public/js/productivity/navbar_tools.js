(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.navbar_tools = NS.navbar_tools || {});

    function __(text) {
        return window.__ ? window.__(text) : text;
    }

    function target() {
        const nav = document.querySelector(".navbar");
        const mount = (
            (nav && (nav.querySelector(".navbar-right") || nav.querySelector(".navbar-nav.navbar-right") || nav.querySelector(".navbar-collapse"))) ||
            nav ||
            document.querySelector(".page-head .page-actions")
        );
        if (mount) mount.classList.add("us-productivity-navbar-target");
        return mount;
    }

    function icon(isFullscreen) {
        if (isFullscreen) return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5h2V6.4l4.3 4.3 1.4-1.4L6.4 5H8V3Zm8 0v2h1.6l-4.3 4.3 1.4 1.4L19 6.4V8h2V3h-5ZM9.3 13.3 5 17.6V16H3v5h5v-2H6.4l4.3-4.3-1.4-1.4Zm5.4 0-1.4 1.4 4.3 4.3H16v2h5v-5h-2v1.6l-4.3-4.3Z"/></svg>';
        return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v2H7.4l4.3 4.3-1.4 1.4L6 7.4V10H4V4Zm10 0h6v6h-2V7.4l-4.3 4.3-1.4-1.4L16.6 6H14V4ZM6 16.6l4.3-4.3 1.4 1.4L7.4 18H10v2H4v-6h2v2.6Zm12 0V14h2v6h-6v-2h2.6l-4.3-4.3 1.4-1.4 4.3 4.3Z"/></svg>';
    }



    function applyInlinePolish(wrap) {
        if (!wrap) return;
        wrap.style.cssText = "order:903;display:inline-flex;align-items:center;flex:0 0 auto;height:38px;margin-inline:0 6px;padding:0;border:0;background:transparent;box-shadow:none;";
        const button = wrap.querySelector(".us-fullscreen-toggle");
        if (button) button.style.cssText = "width:36px;min-width:36px;height:36px;min-height:36px;display:inline-flex;align-items:center;justify-content:center;padding:0;margin:0;border:0;border-radius:9px;background:transparent;box-shadow:none;color:var(--text-color,#111827);cursor:pointer;";
    }

    function isFullscreen() {
        return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    }

    function requestFullscreen() {
        const element = document.documentElement;
        const fn = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
        if (fn) return fn.call(element);
        return Promise.reject(new Error("Fullscreen API not available"));
    }

    function exitFullscreen() {
        const fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (fn) return fn.call(document);
        return Promise.reject(new Error("Fullscreen API not available"));
    }

    function refresh() {
        const button = document.querySelector(".us-fullscreen-toggle");
        if (!button) return;
        const active = isFullscreen();
        button.classList.toggle("is-active", active);
        button.innerHTML = icon(active);
        button.setAttribute("title", active ? __("Exit Fullscreen") : __("Fullscreen"));
        button.setAttribute("aria-label", active ? __("Exit Fullscreen") : __("Fullscreen"));
    }

    function ensure() {
        document.querySelectorAll(".us-navbar-tools").forEach((node, index) => { if (index > 0) node.remove(); });
        let wrap = document.querySelector(".us-navbar-tools");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "us-navbar-tools";
            wrap.setAttribute("aria-label", __("View tools"));
            wrap.innerHTML = '<button type="button" class="us-header-icon-button us-fullscreen-toggle"></button>';
            wrap.addEventListener("click", (event) => {
                const button = event.target.closest(".us-fullscreen-toggle");
                if (!button) return;
                event.preventDefault();
                Promise.resolve(isFullscreen() ? exitFullscreen() : requestFullscreen()).then(refresh).catch(() => {
                    frappe.show_alert({ message: __("Fullscreen is not available in this browser."), indicator: "orange" });
                });
            });
        }
        const lang = document.querySelector(".us-language-switcher");
        if (lang) {
            if (lang.nextElementSibling !== wrap) lang.insertAdjacentElement("afterend", wrap);
        } else {
            const mount = target();
            const user = mount && mount.querySelector(".avatar, .avatar-frame, .navbar-user, .dropdown-avatar");
            const userWrap = user && (user.closest("li,.dropdown,.nav-item,.navbar-item") || user.parentElement);
            if (userWrap && userWrap.parentElement === mount) {
                if (userWrap.nextElementSibling !== wrap) userWrap.insertAdjacentElement("afterend", wrap);
            } else if (mount && wrap.parentElement !== mount) {
                mount.appendChild(wrap);
            }
        }
        applyInlinePolish(wrap);
        refresh();
    }

    mod.init = function () {
        ensure();
        if (!mod.bound) {
            mod.bound = true;
            $(document).on("toolbar_setup.us_navbar_tools page-change.us_navbar_tools", () => setTimeout(ensure, 250));
            document.addEventListener("fullscreenchange", refresh);
            document.addEventListener("webkitfullscreenchange", refresh);
        }
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-navbar-tools").forEach((node) => node.remove());
        if (mod.bound) {
            $(document).off(".us_navbar_tools");
            document.removeEventListener("fullscreenchange", refresh);
            document.removeEventListener("webkitfullscreenchange", refresh);
            mod.bound = false;
        }
    };
})();
