# Copyright (c) 2022, ERPGulf.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import date

class HealthcareItem(Document):
	pass
@frappe.whitelist()
def get_item_detail(item_code):
    item_details=[]
    item_detail=frappe.db.sql(f"""SELECT item_name,stock_uom,valuation_rate,description FROM `tabItem` WHERE item_code='{item_code}';""",as_dict=True)
    
    item_details.append(item_detail)
    return item_details

@frappe.whitelist()
def filter_patients(doctype, txt, searchfield, start, page_len, filters):
    date_today=date.today()
    patient_list=frappe.db.sql(f"""SELECT DISTINCT patient FROM `tabPatient Encounter` WHERE invoiced=0;""")
    
    return patient_list

@frappe.whitelist()
def set_patient_status(patient_name):
    status=frappe.db.sql(f"""UPDATE `tabPatient Encounter` SET invoiced=1 WHERE patient='{patient_name}';""")
    return "done"
