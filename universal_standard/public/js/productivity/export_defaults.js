(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    NS.export_defaults = NS.export_defaults || {};
    NS.export_defaults.init = function (settings, api) {
        // Best-effort placeholder: Frappe's Data Export dialog changes across versions.
        api.log(settings, "Export defaults enabled. Server rules are available through universal_standard.productivity.export_defaults.get_export_defaults.");
    };
})();
