(function () {

	let _settings = null;        // null = not yet loaded
	let _loading = false;
	const _queue = [];          // callbacks waiting for first load

	function getSettings() {
		return _settings || {};
	}

	function loadSettings(callback) {
		if (_settings !== null) {
			if (callback) callback(_settings);
			return;
		}

		if (callback) _queue.push(callback);
		if (_loading) return;
		_loading = true;

		frappe.call({
			method: "frappe.client.get",
			args: { doctype: "Theme Settings", name: "Theme Settings" },
		})
			.then((r) => finish(r?.message || {}))
			.catch(() => finish({}));

		function finish(data) {
			_settings = data;
			_loading = false;
			_queue.splice(0).forEach((fn) => fn(_settings));
		}
	}

	function reloadSettings(callback) {
		_settings = null;
		_loading = false;
		loadSettings(callback);
	}

	function themeColor(key, fallback) {
		const raw = getSettings()[key];
		if (raw != null && String(raw).trim() !== "") return String(raw).trim();
		return fallback === null || fallback === undefined ? null : fallback;
	}

	const STYLE_SIDEBAR = "us-theme-sidebar";
	const STYLE_ICONS = "us-theme-icons";

	function injectSidebarCSS() {
		const bg = themeColor("left_sidebar_bg", "#1D2B48");
		const iconBg = themeColor("left_sidebar_main_icon_bg", "#334155");
		const text = themeColor("left_sidebar_text_color", "#E2E8F0");
		const subtext = themeColor("left_sidebar_subtext_color", "#CBD5E1");
		const inverse = themeColor("text_inverse", "#FFFFFF");
		const primary = themeColor("theme_primary", "#22C1C3");
		const secondary = themeColor("theme_secondary", "#1E90FF");
		const primHover = themeColor("theme_primary_hover", "#2AD2D4");
		const secHover = themeColor("theme_secondary_hover", "#299EFF");
		const gradStart = themeColor("sidebar_active_gradient_start", primary);
		const gradEnd = themeColor("sidebar_active_gradient_end", secondary);

		const canvasRule = themeColor("bg_canvas", null) && `.layout-main-section{background-color:${themeColor("bg_canvas", null)}!important;}`;
		const mutedRule = themeColor("text_muted", null) && `.body-sidebar .standard-sidebar-item .text-muted{color:${themeColor("text_muted", null)}!important;}`;
		const borderRule = themeColor("border_default", null) && `.body-sidebar{border-color:${themeColor("border_default", null)}!important;}`;

		let el = document.getElementById(STYLE_SIDEBAR);
		if (!el) {
			el = document.createElement("style");
			el.id = STYLE_SIDEBAR;
			document.head.appendChild(el);
		}

		el.textContent = `
			:root{
				--us-theme-primary:${primary};
				--us-theme-secondary:${secondary};
				--us-theme-bg-surface:${themeColor("bg_surface", "transparent")};
				--us-theme-bg-muted:${themeColor("bg_muted", "transparent")};
				--us-theme-text-primary:${themeColor("text_primary", "inherit")};
				--us-theme-section-header:${themeColor("section_header", primary)};
			}
			.body-sidebar{background-color:${bg}!important;}
			.body-sidebar .standard-sidebar-item{border-radius:10px!important;margin:2px 6px!important;transition:background .18s,transform .18s,box-shadow .18s!important;}
			.body-sidebar .sidebar-header{background-color:${bg}!important;color:${inverse}!important;}
			.body-sidebar .header-title{color:${inverse}!important;font-weight:600!important;}
			.body-sidebar .header-subtitle{color:${subtext}!important;}
			.body-sidebar .icon-container{background-color:${iconBg}!important;}
			.body-sidebar .standard-sidebar-item .item-anchor{color:${text}!important;border-radius:8px!important;}
			.body-sidebar .standard-sidebar-item .sidebar-item-label{color:${text}!important;}
			.body-sidebar .standard-sidebar-item:hover{background:linear-gradient(135deg,rgba(34,193,195,.22),rgba(30,144,255,.24))!important;box-shadow:0 4px 14px rgba(15,23,42,.22)!important;transform:translateY(-1px)!important;}
			.body-sidebar .standard-sidebar-item:hover .sidebar-item-label,
			.body-sidebar .standard-sidebar-item:hover .item-anchor{color:${inverse}!important;}
			.body-sidebar .standard-sidebar-item.active-sidebar{background:linear-gradient(135deg,${gradStart},${gradEnd})!important;box-shadow:0 6px 16px rgba(30,144,255,.28)!important;transform:translateY(-1px)!important;}
			.body-sidebar .standard-sidebar-item.active-sidebar .sidebar-item-label{color:${inverse}!important;font-weight:600!important;}
			.body-sidebar .collapse-sidebar-link{color:${subtext}!important;display:flex!important;align-items:center!important;gap:8px!important;padding:8px 10px!important;border-radius:8px!important;}
			.body-sidebar .collapse-sidebar-link:hover{color:#000!important;background:rgba(100,116,139,.2)!important;}
			.body-sidebar .body-sidebar-bottom{border-top:1px solid rgba(148,163,184,.22)!important;background-color:${bg}!important;padding:10px 8px 12px!important;}
			.body-sidebar .bottom-edit-controls .discard-button{color:${text}!important;border-color:#64748B!important;background:${iconBg}!important;}
			.body-sidebar .bottom-edit-controls .discard-button:hover{color:${inverse}!important;border-color:#94A3B8!important;background:#475569!important;}
			.body-sidebar .bottom-edit-controls .save-sidebar,
			.body-sidebar .bottom-edit-controls .btn-primary{color:${inverse}!important;background:linear-gradient(135deg,${primary},${secondary})!important;box-shadow:0 6px 16px rgba(30,144,255,.24)!important;}
			.body-sidebar .bottom-edit-controls .save-sidebar:hover,
			.body-sidebar .bottom-edit-controls .btn-primary:hover{background:linear-gradient(135deg,${primHover},${secHover})!important;box-shadow:0 8px 18px rgba(30,144,255,.32)!important;transform:translateY(-1px)!important;}
			.body-sidebar .dropdown-navbar-user .nav-link{border-radius:10px!important;color:${text}!important;}
			.body-sidebar .dropdown-navbar-user .nav-link:hover,
			.body-sidebar .dropdown-navbar-user.show .nav-link{background:rgba(100,116,139,.2)!important;color:${inverse}!important;}
			.body-sidebar .dropdown-navbar-user .avatar-name-email .text-truncate{color:${text}!important;}
			.body-sidebar .dropdown-navbar-user .avatar-name-email .text-secondary{color:#94A3B8!important;}
			.body-sidebar .dropdown-navbar-user .dropdown-menu{background:#243552!important;border:1px solid ${iconBg}!important;border-radius:10px!important;box-shadow:0 10px 24px rgba(15,23,42,.35)!important;}
			.body-sidebar .dropdown-navbar-user .dropdown-item{color:${text}!important;}
			.body-sidebar .dropdown-navbar-user .dropdown-item:hover{color:${inverse}!important;background:linear-gradient(135deg,rgba(34,193,195,.2),rgba(30,144,255,.22))!important;}
			.container>.row:first-child{background-color:${primary}!important;}
			${canvasRule || ""}
			${mutedRule || ""}
			${borderRule || ""}
		`;
	}

	function injectIconCSS() {
		const color = themeColor("left_sidebar_sub_icons_color", themeColor("theme_primary", "#22C1C3"));

		let el = document.getElementById(STYLE_ICONS);
		if (!el) {
			el = document.createElement("style");
			el.id = STYLE_ICONS;
			document.head.appendChild(el);
		}

		el.textContent = `
			.body-sidebar .icon,.body-sidebar .es-icon,.body-sidebar svg,
			.body-sidebar .sidebar-item-icon,.body-sidebar .sidebar-item-icon svg,
			.body-sidebar .collapse-sidebar-link svg,.body-sidebar .header-logo svg{color:${color}!important;}
			.layout-side-section.right .form-sidebar .icon,
			.layout-side-section.right .form-sidebar svg,
			.layout-side-section.right .form-sidebar .icon-btn,
			.layout-side-section.right .form-sidebar .btn.btn-link{color:${color}!important;}
		`;
	}

	const FONT_SIZE_MAP = { Small: "16px", Medium: "20px", Large: "24px" };
	const STYLE_FONT = "us-theme-font-size";

	function injectFontSizeCSS() {
		const size = getSettings().font_size;
		const px = FONT_SIZE_MAP[size] || null;

		let el = document.getElementById("us-theme-font-size");
		if (!el) {
			el = document.createElement("style");
			el.id = STYLE_FONT;
			document.head.appendChild(el);
		}
		el.textContent = px ? `html,body{font-size:${px}!important;}` : "";
	}

	function makeStyleToggle(id, rule) {
		return function (hide) {
			let el = document.getElementById(id);
			if (!el) {
				el = document.createElement("style");
				el.id = id;
				document.head.appendChild(el);
			}
			el.textContent = hide ? rule : "";
		};
	}

	const setLeftSidebarCSS = makeStyleToggle("us-theme-left-sidebar", ".body-sidebar,.body-sidebar-placeholder{display:none!important;}");
	const setRightSidebarCSS = makeStyleToggle("us-theme-right-sidebar", ".layout-side-section.right{display:none!important;}");
	const setFormFooterCSS = makeStyleToggle("us-theme-form-footer", ".form-footer{display:none!important;}");
	const setSearchBarCSS = makeStyleToggle("us-theme-search-bar", ".desktop-search-wrapper,.navbar-search-bar{display:none!important;}");

	function applySidebarBranding() {
		const settings = getSettings();
		const logoUrl = (settings.left_sidebar_app_logo || "").trim();

		$(".sidebar-item-icon .header-logo").each(function () {
			const $wrap = $(this);
			const $existingImg = $wrap.find("img:not(.us-theme-logo)");

			if (logoUrl) {
				if ($existingImg.length) {
					$existingImg.attr("src", logoUrl);
				} else {
					$wrap.find(".icon-container").hide();
					let $brandImg = $wrap.find("img.us-theme-logo");
					if (!$brandImg.length) {
						$brandImg = $("<img>")
							.addClass("us-theme-logo")
							.css({ width: "32px", height: "32px", objectFit: "contain" });
						$wrap.prepend($brandImg);
					}
					$brandImg.attr("src", logoUrl).show();
				}
			} else {
				$wrap.find(".icon-container").show();
				$wrap.find("img.us-theme-logo").remove();
			}
		});

		if ((settings.left_sidebar_app_title || "").trim()) {
			$(".sidebar-item-label.header-title").text(settings.left_sidebar_app_title.trim());
		}

		if ((settings.left_sidebar_app_subtitle || "").trim()) {
			$(".sidebar-item-label.header-subtitle").text(settings.left_sidebar_app_subtitle.trim());
		}
	}

	function applyLayoutToggles() {
		const s = getSettings();
		if (s.hide_left_sidebar) setLeftSidebarCSS(true);
		if (s.hide_right_sidebar) setRightSidebarCSS(true);
		if (s.hide_form_footer) setFormFooterCSS(true);
		if (s.hide_search_bar) setSearchBarCSS(true);

		frappe.call({
			method: "frappe.client.get_value",
			args: {
				doctype: "Theme Settings",
				fieldname: ["hide_left_sidebar", "hide_right_sidebar", "hide_form_footer", "hide_search_bar"],
			},
		}).then((r) => {
			const msg = r?.message || {};
			setLeftSidebarCSS(!!msg.hide_left_sidebar);
			setRightSidebarCSS(!!msg.hide_right_sidebar);
			setFormFooterCSS(!!msg.hide_form_footer);
			setSearchBarCSS(!!msg.hide_search_bar);
		}).catch(() => {});
	}

	let _searchKeyBlockerInstalled = false;

	function installSearchKeyBlocker() {
		if (_searchKeyBlockerInstalled) return;
		_searchKeyBlockerInstalled = true;

		window.addEventListener("keydown", function (e) {
			const s = getSettings();
			if (!s.hide_search_bar) return;

			const key = (e.key || "").toLowerCase();
			const ctrl = e.ctrlKey || e.metaKey;
			if (ctrl && (key === "k" || key === "g")) {
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();
			}
		}, true);
	}

	function applyThemeSetup() {
		loadSettings(function () {
			injectSidebarCSS();
			injectIconCSS();
			injectFontSizeCSS();
			applyLayoutToggles();
			applySidebarBranding();
			setTimeout(applySidebarBranding, 300);
		});

		installSearchKeyBlocker();

		if (frappe.ui && frappe.ui.form && frappe.ui.form.Form) {
			const proto = frappe.ui.form.Form.prototype;
			if (proto.render && !proto._us_theme_render_patched) {
				proto._us_theme_render_patched = true;
				const originalRender = proto.render;
				proto.render = function () {
					const result = originalRender.apply(this, arguments);
					setTimeout(injectIconCSS, 100);
					return result;
				};
			}
		}

		frappe.realtime.on("theme_settings_changed", function (data) {
			_settings = Object.assign({}, _settings || {}, data || {});
			setLeftSidebarCSS(!!data.hide_left_sidebar);
			setRightSidebarCSS(!!data.hide_right_sidebar);
			setFormFooterCSS(!!data.hide_form_footer);
			setSearchBarCSS(!!data.hide_search_bar);
			applySidebarBranding();

			reloadSettings(function () {
				injectSidebarCSS();
				injectIconCSS();
				injectFontSizeCSS();
				applyLayoutToggles();
			});
		});

		$(document).on("page-change app-route-change", function () {
			applyLayoutToggles();
			applySidebarBranding();
		});
		if (frappe.router && frappe.router.on) {
			frappe.router.on("change", applyLayoutToggles);
		}
		frappe.after_ajax(applyLayoutToggles);
	}

	injectSidebarCSS();
	injectIconCSS();

	if (typeof jQuery !== "undefined") {
		jQuery(document).on("app_ready", applyThemeSetup);
	} else {
		document.addEventListener("DOMContentLoaded", function waitForReady() {
			if (typeof jQuery !== "undefined") {
				jQuery(document).on("app_ready", applyThemeSetup);
			} else {
				setTimeout(waitForReady, 50);
			}
		});
	}
})();

(function () {
	var _settings = null;
	var _loading = false;
	var _queue = [];

	function loadSettings(callback) {
		if (_settings !== null) {
			if (callback) callback(_settings);
			return;
		}
		if (callback) _queue.push(callback);
		if (_loading) return;
		_loading = true;

		frappe.call({
			method: "frappe.client.get_value",
			args: { doctype: "Theme Settings", fieldname: "hide_search_bar" },
		}).then(function (r) {
			_settings = r && r.message ? r.message : {};
			_loading = false;
			_queue.splice(0).forEach((fn) => fn(_settings));
		}).catch(function () {
			_settings = {};
			_loading = false;
			_queue.splice(0).forEach((fn) => fn(_settings));
		});
	}

	var _origSetupAwesomebar = null;

	function patchDesktopProto() {
		if (typeof DesktopPage === "undefined") return false;
		if (DesktopPage.prototype._us_theme_search_patched) return true;

		_origSetupAwesomebar = DesktopPage.prototype.setup_awesomebar;
		DesktopPage.prototype._us_theme_search_patched = true;

		DesktopPage.prototype.setup_awesomebar = function () {
			var self = this;
			self.awesomebar_setup = true;
			loadSettings(function (s) {
				if (s.hide_search_bar) {
					$(".desktop-search-wrapper").hide();
				} else {
					$(".desktop-search-wrapper").show();
					self.awesomebar_setup = false;
					if (_origSetupAwesomebar) {
						_origSetupAwesomebar.call(self);
					}
				}
			});
		};

		return true;
	}

	function applyHide() {
		$(".desktop-search-wrapper").hide();
	}

	function applyShow() {
		$(".desktop-search-wrapper").show();
	}

	function setup() {
		if (!patchDesktopProto()) {
			(function tryPatch() {
				if (!patchDesktopProto()) setTimeout(tryPatch, 50);
			})();
		}

		loadSettings(function (s) {
			if (s.hide_search_bar) applyHide();
		});

		frappe.realtime.on("theme_settings_changed", function (data) {
			_settings = Object.assign(_settings || {}, data);
			if (data.hide_search_bar) {
				applyHide();
			} else {
				applyShow();
			}
		});

		$(document).on("page-change app-route-change", function () {
			loadSettings(function (s) {
				if (s.hide_search_bar) applyHide();
			});
		});
	}

	patchDesktopProto();
	if (typeof jQuery !== "undefined") {
		jQuery(document).on("app_ready", setup);
	} else {
		document.addEventListener("DOMContentLoaded", function trySetup() {
			if (typeof jQuery !== "undefined") {
				jQuery(document).on("app_ready", setup);
			} else {
				setTimeout(trySetup, 50);
			}
		});
	}
})();

(function () {
	let _settings = null;
	let _loading = false;
	const _queue = [];

	function loadSettings(callback) {
		if (_settings !== null) {
			if (callback) callback(_settings);
			return;
		}
		if (callback) _queue.push(callback);
		if (_loading) return;
		_loading = true;

		frappe.call({
			method: "frappe.client.get",
			args: { doctype: "Theme Settings", name: "Theme Settings" },
		}).then(function (r) {
			_settings = r?.message || {};
			_loading = false;
			_queue.splice(0).forEach(function (fn) { fn(_settings); });
		}).catch(function () {
			_settings = {};
			_loading = false;
			_queue.splice(0).forEach(function (fn) { fn(_settings); });
		});
	}

	function reloadSettings(callback) {
		_settings = null;
		_loading = false;
		loadSettings(callback);
	}

	const BUTTONS = [
		{ key: "navbar_show_print", label: "Print", action: function (frm) { frm.print_doc(); } },
		{ key: "navbar_show_assign", label: "Assign To", action: function (frm) { frm.assign_to.add(); } },
		{ key: "navbar_show_attachments", label: "Attachments", action: function (frm) { frm.attachments.new_attachment(); } },
		{ key: "navbar_show_share", label: "Share", action: function (frm) { frm.shared.show(); } },
	];

	function addButtonsToForm(frm) {
		if (!frm || !frm.doc || frm.doc.__islocal) return;

		loadSettings(function (s) {
			if (!s.hide_right_sidebar) return;

			BUTTONS.forEach(function (btn) {
				if (s[btn.key] != 1) return;
				frm.add_custom_button(__(btn.label), function () {
					btn.action(frm);
				});
			});
		});
	}

	function setup() {
		$(document).on("form-refresh", function (_, frm) {
			setTimeout(function () { addButtonsToForm(frm); }, 0);
		});

		if (frappe.ui && frappe.ui.form && frappe.ui.form.Form) {
			const proto = frappe.ui.form.Form.prototype;
			if (proto.clear_custom_buttons && !proto._us_theme_form_btn_patched) {
				proto._us_theme_form_btn_patched = true;
				const original = proto.clear_custom_buttons;
				proto.clear_custom_buttons = function () {
					const result = original.apply(this, arguments);
					const self = this;
					setTimeout(function () { addButtonsToForm(self); }, 0);
					return result;
				};
			}
		}

		frappe.realtime.on("doc_update", function (data) {
			if (data.doctype !== "Theme Settings") return;
			reloadSettings(function () {
				if (typeof cur_frm !== "undefined" && cur_frm) {
					cur_frm.clear_custom_buttons();
				}
			});
		});

		if (typeof cur_frm !== "undefined" && cur_frm) {
			addButtonsToForm(cur_frm);
		}
	}

	if (typeof jQuery !== "undefined") {
		jQuery(document).on("app_ready", setup);
	} else {
		document.addEventListener("DOMContentLoaded", function trySetup() {
			if (typeof jQuery !== "undefined") {
				jQuery(document).on("app_ready", setup);
			} else {
				setTimeout(trySetup, 50);
			}
		});
	}
})();
