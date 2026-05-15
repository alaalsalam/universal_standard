(function () {
    var SAR_SYMBOL = "\u00A7";
    var SAR_UNICODE_SYMBOL = "\u20C1";
    var CURRENCY_SELECTORS = [
        ".currency", ".money", "[data-fieldtype='Currency']", ".number-widget-box",
        ".query-report", ".report-wrapper", ".datatable", ".frappe-list",
        ".form-dashboard", ".layout-main-section"
    ].join(",");

    function normalizeCurrencyHtml(value) {
        if (typeof value !== "string") return value;
        return value.replace(/\$/g, SAR_SYMBOL).replace(/SAR/g, SAR_SYMBOL).replace(new RegExp(SAR_UNICODE_SYMBOL, "g"), SAR_SYMBOL);
    }

    function patch(container, key) {
        if (!container || typeof container[key] !== "function" || container[key].__us_sar_patched) return;
        var original = container[key];
        var patched = function () { return normalizeCurrencyHtml(original.apply(this, arguments)); };
        patched.__us_sar_patched = true;
        container[key] = patched;
    }

    function patchSaudiCurrencyFormatters() {
        if (window.frappe && window.frappe.boot) {
            window.frappe.boot.sysdefaults = window.frappe.boot.sysdefaults || {};
            window.frappe.boot.sysdefaults.currency = "SAR";
            window.frappe.boot.currency_symbols = window.frappe.boot.currency_symbols || {};
            window.frappe.boot.currency_symbols.SAR = SAR_SYMBOL;
            if (window.frappe.boot.currency_info && window.frappe.boot.currency_info.SAR) window.frappe.boot.currency_info.SAR.symbol = SAR_SYMBOL;
        }
        if (window.frappe) {
            patch(window.frappe.formatters, "Currency");
            patch(window.frappe.form && window.frappe.form.formatters, "Currency");
            patch(window.frappe.utils, "format_currency");
        }
        if (typeof window.format_currency === "function" && !window.format_currency.__us_sar_patched) {
            var originalFormatCurrency = window.format_currency;
            window.format_currency = function () { return normalizeCurrencyHtml(originalFormatCurrency.apply(this, arguments)); };
            window.format_currency.__us_sar_patched = true;
        }
    }

    function normalizeSaudiCurrencyText(root) {
        root = root || document.body;
        if (!root) return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (!node.nodeValue || (node.nodeValue.indexOf("$") === -1 && node.nodeValue.indexOf(SAR_UNICODE_SYMBOL) === -1)) return NodeFilter.FILTER_REJECT;
                var parent = node.parentElement;
                if (!parent || !parent.closest(CURRENCY_SELECTORS)) return NodeFilter.FILTER_REJECT;
                if (!/[$\u20C1]\s*[\d,]+|[\d,]+\.\d+\s*[$\u20C1]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        var nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].nodeValue = normalizeCurrencyHtml(nodes[i].nodeValue);
            if (nodes[i].parentElement) nodes[i].parentElement.classList.add("us-saudi-currency");
        }
    }

    function bindSaudiCurrencyFix() {
        patchSaudiCurrencyFormatters();
        normalizeSaudiCurrencyText();
        if (window.jQuery) {
            window.jQuery(document).on("toolbar_setup page-change ajaxComplete shown.bs.tab", function () {
                patchSaudiCurrencyFormatters();
                normalizeSaudiCurrencyText();
            });
        }
        if (window.frappe && window.frappe.router && window.frappe.router.on) {
            window.frappe.router.on("change", function () {
                setTimeout(function () {
                    patchSaudiCurrencyFormatters();
                    normalizeSaudiCurrencyText();
                }, 250);
            });
        }
        if (window.MutationObserver && document.body) {
            var observer = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    for (var j = 0; j < mutations[i].addedNodes.length; j++) {
                        var node = mutations[i].addedNodes[j];
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            patchSaudiCurrencyFormatters();
                            normalizeSaudiCurrencyText(node);
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    var timer = setInterval(function () {
        if (document.body) {
            clearInterval(timer);
            bindSaudiCurrencyFix();
        }
    }, 300);
})();
