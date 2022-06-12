frappe.ui.form.on('Healthcare Item', "item_code",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    let item_code=item.item_code;
    console.log(item_code)
    if(item_code){
       frappe.call({
	          method:"patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.get_item_detail",
	          args:{item_code:item_code}
	      }).done((r)=>{
	          item.item_name=r.message[0][0].item_name
	          item.description=r.message[0][0].description
	          item.uom=r.message[0][0].stock_uom
	          item.conversion_factor=1
	          item.rate=r.message[0][0].valuation_rate
	         let item_qty=item.qty;
	         let item_rate=item.rate;
	          refresh_field("items")
	         console.log(item_qty)
	   
	      })
    }
})

frappe.ui.form.on('Healthcare Item', "qty",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    console.log(item.qty)
    item.amount=(item.qty)*(item.rate)
     refresh_field("items")
})