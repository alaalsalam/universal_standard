(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.navbar_tools = NS.navbar_tools || {});

    function __(text) {
        return window.__ ? window.__(text) : text;
    }

    function navbarRight() {
        return document.querySelector(".navbar-right, .navbar .navbar-nav.ml-auto, .navbar .navbar-nav.navbar-right");
    }

    function fullscreenIcon(active) {
        const path = active
            ? "M8 3H3v5h2V6.4l4.3 4.3 1.4-1.4L6.4 5H8V3Zm8 0v2h1.6l-4.3 4.3 1.4 1.4L19 6.4V8h2V3h-5ZM9.3 13.3 5 17.6V16H3v5h5v-2H6.4l4.3-4.3-1.4-1.4Zm5.4 0-1.4 1.4 4.3 4.3H16v2h5v-5h-2v1.6l-4.3-4.3Z"
            : "M4 4h6v2H7.4l4.3 4.3-1.4 1.4L6 7.4V10H4V4Zm10 0h6v6h-2V7.4l-4.3 4.3-1.4-1.4L16.6 6H14V4ZM6 16.6l4.3-4.3 1.4 1.4L7.4 18H10v2H4v-6h2v2.6Zm12 0V14h2v6h-6v-2h2.6l-4.3-4.3 1.4-1.4 4.3 4.3Z";
        return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
    }

    function isFullscreen() {
        return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function refresh(button) {
        const active = isFullscreen();
        button.classList.toggle("is-active", active);
        button.innerHTML = fullscreenIcon(active);
        button.setAttribute("title", active ? __("Exit Fullscreen") : __("Fullscreen"));
        button.setAttribute("aria-label", active ? __("Exit Fullscreen") : __("Fullscreen"));
    }

    function render() {
        const target = navbarRight();
        const language = target?.querySelector(":scope > .us-language-switcher");
        if (!target) return;

        let wrap = target.querySelector(":scope > .us-navbar-tools");
        target.querySelectorAll(":scope > .us-navbar-tools").forEach((node, index) => {
            if (index > 0) node.remove();
        });
        if (!wrap) {
            wrap = document.createElement("li");
            wrap.className = "nav-item us-navbar-tools";
            wrap.innerHTML = '<button type="button" class="nav-link btn-reset us-header-icon-button"></button>';
            const button = wrap.querySelector("button");
            button.addEventListener("click", () => {
                const element = document.documentElement;
                const request = element.requestFullscreen || element.webkitRequestFullscreen;
                const exit = document.exitFullscreen || document.webkitExitFullscreen;
                const action = isFullscreen() ? exit?.call(document) : request?.call(element);
                Promise.resolve(action).catch(() => {
                    frappe.show_alert({ message: __("Fullscreen is not available in this browser."), indicator: "orange" });
                });
            });
            document.addEventListener("fullscreenchange", () => refresh(button));
            document.addEventListener("webkitfullscreenchange", () => refresh(button));
        }

        if (language) language.insertAdjacentElement("beforebegin", wrap);
        else if (wrap.parentElement !== target) target.appendChild(wrap);
        refresh(wrap.querySelector("button"));
    }

    mod.init = function () {
        render();
        if (mod.bound) return;
        mod.bound = true;
        $(document).on("toolbar_setup.us_navbar_tools page-change.us_navbar_tools", () => setTimeout(render, 100));
    };

    mod.destroy = function () {
        document.querySelectorAll(".us-navbar-tools").forEach((node) => node.remove());
        if (mod.bound) {
            $(document).off(".us_navbar_tools");
            mod.bound = false;
        }
    };
})();
