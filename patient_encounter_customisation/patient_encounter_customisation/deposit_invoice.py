# Copyright (c) 2021, Britlog and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.utils import get_fetch_values
from frappe.model.mapper import get_mapped_doc
from frappe.contacts.doctype.address.address import get_company_address


@frappe.whitelist()
def get_payment_schedule_query(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""SELECT payment_term
FROM `tabPayment Schedule` ps
WHERE ps.parent = '{0}'
  AND ps.payment_term IS NOT NULL 
  AND NOT EXISTS (
      SELECT 1 
      FROM `tabSales Invoice` si left join `tabSales Invoice Item` sit on sit.parent=si.name
      WHERE si.custom_sales_order_payment_term = ps.payment_term and sit.sales_order=ps.parent
  ) order by ps.idx
		""".format(filters.get("parent")))


@frappe.whitelist()
def make_deposit_invoice(source_name, target_doc=None, ignore_permissions=False):
    def postprocess(source, target):
        set_missing_values(source, target)
        # Get the advance paid Journal Entries in Sales Invoice Advance
        if target.get("allocate_advances_automatically"):
            target.set_advances()
        # Set the custom field value for selected payment term
        if frappe.flags.args and frappe.flags.args.payment_term:
            target.custom_sales_order_payment_term = frappe.flags.args.payment_term

    def set_missing_values(source, target):
        target.ignore_pricing_rule = 1
        target.flags.ignore_permissions = True
        target.run_method("set_missing_values")
        target.run_method("set_po_nos")
        target.run_method("calculate_taxes_and_totals")

        if source.company_address:
            target.update({'company_address': source.company_address})
        else:
            # set company address
            target.update(get_company_address(target.company))

        if target.company_address:
            target.update(get_fetch_values("Sales Invoice", 'company_address', target.company_address))

        # set print heading
        #target.select_print_heading = frappe.db.get_single_value('ERPNext France Settings', 'deposit_print_heading')

    def update_item(source, target, source_parent):

        if frappe.flags.args and frappe.flags.args.payment_term:
            for term in source_parent.payment_schedule:
                if frappe.flags.args.payment_term == term.payment_term:
                    invoice_portion = term.invoice_portion
                    target.qty = source.qty * (invoice_portion / 100)
                    target.description = source.description \
                                         + "<br>Partial of  {0} % on order no {1}".format(invoice_portion,
                                                                                                source_parent.name)

    doclist = get_mapped_doc("Sales Order", source_name, {
        "Sales Order": {
            "doctype": "Sales Invoice",
            "field_map": {
                "party_account_currency": "party_account_currency"
            },
            "validation": {
                "docstatus": ["=", 1]
            }
        },
        "Sales Order Item": {
            "doctype": "Sales Invoice Item",
            "field_map": {
                "name": "so_detail",
                "parent": "sales_order",
            },
            "postprocess": update_item
        },
        "Sales Taxes and Charges": {
            "doctype": "Sales Taxes and Charges",
            "add_if_empty": True
        },
        "Sales Team": {
            "doctype": "Sales Team",
            "add_if_empty": True
        }
    }, target_doc, postprocess, ignore_permissions=ignore_permissions)

    return doclist
