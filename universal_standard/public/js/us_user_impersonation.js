frappe.ui.form.on("User", {
	refresh(frm) {
		if (!frm.doc || !frm.doc.name || frm.is_new()) return;
		if (frm.__us_impersonation_checked_for === frm.doc.name) return;
		frm.__us_impersonation_checked_for = frm.doc.name;

		frappe.call({
			method: "universal_standard.api.can_impersonate_user",
			args: { user: frm.doc.name },
			callback(r) {
				if (!r.message || !r.message.allowed) return;
				frm.add_custom_button(__("Impersonate"), () => {
					frappe.confirm(
						__("You will switch your current session to this user. Continue?"),
						() => {
							frappe.call({
								method: "universal_standard.api.impersonate_user",
								args: { user: frm.doc.name },
								freeze: true,
								freeze_message: __("Switching user..."),
								callback(res) {
									const message = res.message || {};
									if (message.status === "Success") {
										frappe.show_alert({ message: message.message, indicator: "green" });
										window.location.href = "/app";
									} else {
										frappe.throw(message.message || __("Impersonation failed"));
									}
								},
							});
						}
					);
				});
			},
		});
	},
});
