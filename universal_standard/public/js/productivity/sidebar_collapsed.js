(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    NS.sidebar_collapsed = NS.sidebar_collapsed || {};
    NS.sidebar_collapsed.init = function () {
        document.body.classList.add("us-sidebar-collapsed-default");
    };
    NS.sidebar_collapsed.destroy = function () {
        document.body.classList.remove("us-sidebar-collapsed-default");
    };
})();
