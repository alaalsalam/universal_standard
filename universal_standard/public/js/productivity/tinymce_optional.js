(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    NS.tinymce_optional = NS.tinymce_optional || {};
    NS.tinymce_optional.init = function (settings, api) {
        api.log(settings, "TinyMCE optional is configured but no local TinyMCE asset is bundled yet.");
    };
})();
