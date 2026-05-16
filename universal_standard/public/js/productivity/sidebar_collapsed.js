(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.sidebar_collapsed = NS.sidebar_collapsed || {});
    const KEY = "universal_standard.sidebar.preference";

    function isMobile() {
        return window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
    }

    function setCollapsed(collapsed, persist) {
        document.body.classList.toggle("us-sidebar-collapsed-default", Boolean(collapsed) && !isMobile());
        const button = document.querySelector(".us-sidebar-preference");
        if (button) {
            button.classList.toggle("is-collapsed", Boolean(collapsed));
            button.setAttribute("aria-pressed", collapsed ? "true" : "false");
            button.title = collapsed ? __("Keep sidebar expanded") : __("Collapse sidebar");
        }
        if (persist) localStorage.setItem(KEY, collapsed ? "collapsed" : "expanded");
    }

    function ensureToggle() {
        const sidebar = document.querySelector(".layout-side-section");
        if (!sidebar || sidebar.querySelector(".us-sidebar-preference")) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "us-sidebar-preference";
        button.innerHTML = `<span aria-hidden="true">‹</span>`;
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const collapsed = !document.body.classList.contains("us-sidebar-collapsed-default");
            setCollapsed(collapsed, true);
        });
        sidebar.prepend(button);
    }

    mod.init = function () {
        if (isMobile()) return;
        const preference = localStorage.getItem(KEY);
        setCollapsed(preference !== "expanded", false);
        ensureToggle();
        if (!mod.bound) {
            mod.bound = true;
            $(document).on("page-change.us_sidebar_collapsed toolbar_setup.us_sidebar_collapsed", () => setTimeout(() => {
                ensureToggle();
                setCollapsed(localStorage.getItem(KEY) !== "expanded", false);
            }, 250));
            mod.onResize = () => setCollapsed(localStorage.getItem(KEY) !== "expanded", false);
            window.addEventListener("resize", mod.onResize);
        }
    };

    mod.destroy = function () {
        document.body.classList.remove("us-sidebar-collapsed-default");
        document.querySelectorAll(".us-sidebar-preference").forEach((node) => node.remove());
        if (mod.bound) {
            $(document).off(".us_sidebar_collapsed");
            if (mod.onResize) window.removeEventListener("resize", mod.onResize);
            mod.bound = false;
        }
    };
})();
