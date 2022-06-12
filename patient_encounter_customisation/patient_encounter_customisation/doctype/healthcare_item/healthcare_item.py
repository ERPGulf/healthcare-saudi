# Copyright (c) 2022, ERPGulf.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HealthcareItem(Document):
	pass
@frappe.whitelist()
def get_item_detail(item_code):
    item_details=[]
    item_detail=frappe.db.sql(f"""SELECT item_name,stock_uom,valuation_rate,description FROM `tabItem` WHERE item_code='{item_code}';""",as_dict=True)
    item_details.append(item_detail)
    return item_details