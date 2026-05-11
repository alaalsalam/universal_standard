(function () {
	var TOGGLE_API_METHOD = "universal_standard.api.toggle_language";
	var RETRY_MS = 400;
	var RETRY_MAX = 30;
	var WIRED = false;
	var SAR_SYMBOL = "\u00A7";
	var SAR_UNICODE_SYMBOL = "\u20C1";
	var CURRENCY_SELECTORS = [
		".currency",
		".money",
		"[data-fieldtype='Currency']",
		".number-widget-box",
		".query-report",
		".report-wrapper",
		".datatable",
		".frappe-list",
		".form-dashboard",
		".layout-main-section"
	].join(",");

	function getLang() {
		var boot = window.frappe && window.frappe.boot ? window.frappe.boot : null;
		if (boot && boot.lang) return String(boot.lang).toLowerCase();
		if (boot && boot.user && typeof boot.user === "object" && boot.user.language) {
			return String(boot.user.language).toLowerCase();
		}
		return "ar";
	}

	function getLabel() {
		return getLang() === "ar" ? "EN" : "AR";
	}

	function getTitle() {
		return getLang() === "ar" ? "Switch Language" : "تغيير اللغة";
	}

	function currentPath() {
		var path = window.location.pathname || "/app";
		var search = window.location.search || "";
		if (!path.startsWith("/app")) return "/app";
		return path + search;
	}

	function getOrCreateSwitch() {
		var nodes = document.querySelectorAll(".us-language-switch");
		for (var i = 1; i < nodes.length; i++) nodes[i].remove();

		var sw = nodes[0];
		if (!sw) {
			sw = document.createElement("a");
			sw.className = "us-language-switch";
			sw.href = currentPath();
			document.body.appendChild(sw);
		}

		sw.href = currentPath();
		sw.textContent = getLabel();
		sw.title = getTitle();
		return sw;
	}

	function getNavbarTarget() {
		var selectors = [
			".header-menu .dropdown.user",
			"ul.header-menu > li.dropdown.user",
			".dropdown-navbar-user",
			".navbar .navbar-nav .dropdown.dropdown-navbar-user",
			".navbar .header-menu .dropdown.user",
			".navbar .navbar-nav .dropdown:last-child",
			".header-menu > li:last-child"
		];

		for (var i = 0; i < selectors.length; i++) {
			var el = document.querySelector(selectors[i]);
			if (el && el.parentNode) return el;
		}

		return null;
	}

	function removeLegacyLanguageSwitchers() {
		var selectors = [".language-toggle", "#languages_dropdown", ".us-legacy-language-switch", "a[data-lang_code]"];

		for (var i = 0; i < selectors.length; i++) {
			var nodes = document.querySelectorAll(selectors[i]);
			for (var j = 0; j < nodes.length; j++) {
				var node = nodes[j];
				if (!node) continue;
				if (node.classList && node.classList.contains("us-language-switch")) continue;
				if (node.id === "navbar-search" || node.closest(".us-language-slot")) continue;
				var dropdownHelp = node.closest(".dropdown-help");
				if (dropdownHelp && dropdownHelp.querySelector("#languages_dropdown")) {
					dropdownHelp.remove();
					continue;
				}
				node.remove();
			}
		}
	}

	function placeSwitch() {
		removeLegacyLanguageSwitchers();
		var sw = getOrCreateSwitch();
		var target = getNavbarTarget();

		if (target) {
			var li = document.querySelector("li.us-language-slot");
			if (!li) {
				li = document.createElement("li");
				li.className = "nav-item us-language-slot";
				target.parentNode.insertBefore(li, target);
			}

			if (sw.parentNode !== li) li.appendChild(sw);
			sw.classList.add("us-in-navbar");
			sw.classList.remove("us-floating");
			return;
		}

		if (sw.parentNode !== document.body) document.body.appendChild(sw);
		sw.classList.add("us-floating");
		sw.classList.remove("us-in-navbar");
	}

	function wireToggleAction() {
		if (WIRED) return;
		WIRED = true;

		document.addEventListener(
			"click",
			function (event) {
				var anchor = event.target && event.target.closest ? event.target.closest(".us-language-switch") : null;
				if (!anchor) return;

				event.preventDefault();
				anchor.classList.add("disabled");

				if (!(window.frappe && window.frappe.call)) {
					window.location.reload();
					return;
				}

				window.frappe.call({
					method: TOGGLE_API_METHOD,
					type: "POST",
					callback: function () {
						window.location.reload();
					},
					error: function () {
						anchor.classList.remove("disabled");
					}
				});
			},
			true
		);
	}

	function normalizeCurrencyHtml(value) {
		if (typeof value !== "string") return value;
		return value
			.replace(/\$/g, SAR_SYMBOL)
			.replace(/SAR/g, SAR_SYMBOL)
			.replace(new RegExp(SAR_UNICODE_SYMBOL, "g"), SAR_SYMBOL);
	}

	function patchSaudiCurrencyFormatters() {
		if (window.frappe && window.frappe.boot) {
			window.frappe.boot.sysdefaults = window.frappe.boot.sysdefaults || {};
			window.frappe.boot.sysdefaults.currency = "SAR";
			window.frappe.boot.currency_symbols = window.frappe.boot.currency_symbols || {};
			window.frappe.boot.currency_symbols.SAR = SAR_SYMBOL;
			if (window.frappe.boot.currency_info && window.frappe.boot.currency_info.SAR) {
				window.frappe.boot.currency_info.SAR.symbol = SAR_SYMBOL;
			}
		}

		function patch(container, key) {
			if (!container || typeof container[key] !== "function" || container[key].__us_sar_patched) return;
			var original = container[key];
			var patched = function () {
				return normalizeCurrencyHtml(original.apply(this, arguments));
			};
			patched.__us_sar_patched = true;
			container[key] = patched;
		}

		if (window.frappe) {
			patch(window.frappe.formatters, "Currency");
			patch(window.frappe.form && window.frappe.form.formatters, "Currency");
			patch(window.frappe.utils, "format_currency");
		}
		if (typeof window.format_currency === "function" && !window.format_currency.__us_sar_patched) {
			var originalFormatCurrency = window.format_currency;
			window.format_currency = function () {
				return normalizeCurrencyHtml(originalFormatCurrency.apply(this, arguments));
			};
			window.format_currency.__us_sar_patched = true;
		}
	}

	function normalizeSaudiCurrencyText(root) {
		root = root || document.body;
		if (!root) return;
		var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
			acceptNode: function (node) {
				if (!node.nodeValue || (node.nodeValue.indexOf("$") === -1 && node.nodeValue.indexOf(SAR_UNICODE_SYMBOL) === -1)) {
					return NodeFilter.FILTER_REJECT;
				}
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

	function bind() {
		wireToggleAction();
		placeSwitch();
		bindSaudiCurrencyFix();

		if (window.jQuery) {
			window.jQuery(document).on("toolbar_setup page-change", function () {
				placeSwitch();
				patchSaudiCurrencyFormatters();
				normalizeSaudiCurrencyText();
			});
		}

		if (window.frappe && window.frappe.router && window.frappe.router.on) {
			window.frappe.router.on("change", function () {
				placeSwitch();
				patchSaudiCurrencyFormatters();
				normalizeSaudiCurrencyText();
			});
		}
	}

	var tries = 0;
	var timer = setInterval(function () {
		tries += 1;
		if (document.body) {
			clearInterval(timer);
			bind();
		}
		if (tries >= RETRY_MAX) clearInterval(timer);
	}, RETRY_MS);
})();
