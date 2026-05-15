(function () {
    const NS = (window.UniversalStandardProductivity = window.UniversalStandardProductivity || {});
    const mod = (NS.list_unassign = NS.list_unassign || {});
    function getListView() { return cur_list || (frappe && frappe.views && frappe.views.ListView && frappe.views.ListView.current); }
    function addAction() {
        const list = getListView();
        if (!list || !list.page || list.__us_unassign_added) return;
        list.__us_unassign_added = true;
        list.page.add_actions_menu_item(__("Unassign Selected"), () => {
            const checked = list.get_checked_items ? list.get_checked_items() : [];
            if (!checked.length) { frappe.msgprint(__("Please select records first.")); return; }
            frappe.call({
                method: "universal_standard.productivity.list_unassign.unassign_selected",
                args: { doctype: list.doctype, names: checked.map(x => x.name) },
                callback: r => {
                    frappe.show_alert({ message: __("Assignments removed") + ": " + ((r.message && r.message.removed) || 0), indicator: "green" });
                    list.refresh();
                }
            });
        });
    }
    mod.init = function () {
        addAction();
        $(document).on("page-change toolbar_setup", () => setTimeout(addAction, 300));
    };
})();
