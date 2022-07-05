# Copyright (c) 2022, ERPGulf.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import date
from erpnext.stock.get_item_details import get_item_details

class HealthcareItem(Document):
	pass

# get item detail from doctype 'Item'
@frappe.whitelist()
def get_item_detail(item_code='Kratom'):
    item_details=[]
    item_detail=frappe.db.sql(f"""SELECT item_name,stock_uom,valuation_rate,description FROM `tabItem` WHERE item_code='{item_code}';""",as_dict=True)
   
    price_list_rate=frappe.db.sql(f"""SELECT  price_list_rate FROM `tabItem Price` WHERE item_code='{item_code}';""",as_dict=True)
    item_detail.append(price_list_rate)
    item_details.append(item_detail)
    return item_details

# get patients whose status is not invoiced
@frappe.whitelist()
def filter_patients(doctype, txt, searchfield, start, page_len, filters):
    date_today=date.today()
    patient_list=frappe.db.sql(f"""SELECT DISTINCT patient FROM `tabPatient Encounter` WHERE invoiced=0;""")
    
    return patient_list

# set patient status as invoiced
@frappe.whitelist()
def set_patient_status(patient_name):
    status=frappe.db.sql(f"""UPDATE `tabPatient Encounter` SET invoiced=1 WHERE patient='{patient_name}';""")
    return "done"
   
# gets the items in items table to sales invoice
@frappe.whitelist()
def get_items_to_invoice(encounter):
	encounter = frappe.get_doc("Patient Encounter", encounter)
	if encounter:
		patient = frappe.get_doc("Patient", encounter.patient)
		if patient:
			if patient.customer:
				items_to_invoice = []
				for drug_line in encounter.items:
					if drug_line.item_code:
						qty = 1
						if frappe.db.get_value("Item", drug_line.item_code, "stock_uom") == "Nos":
							qty = drug_line.qty

						description = drug_line.description
						

						items_to_invoice.append(
							{"drug_code": drug_line.item_code, "quantity": qty, "description": description}
						)
				return items_to_invoice
			else:
				validate_customer_created(patient)