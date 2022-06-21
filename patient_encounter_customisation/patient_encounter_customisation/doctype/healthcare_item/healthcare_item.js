frappe.ui.form.on('Healthcare Item', "item_code",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    let item_code=item.item_code;
    
    if(item_code){
       frappe.call({
	          method:"patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.get_item_detail",
	          args:{item_code:item_code}
	      }).done((r)=>{
			  
	          item.item_name=r.message[0][0].item_name
	          item.description=r.message[0][0].description
	          item.uom=r.message[0][0].stock_uom
	          item.conversion_factor=1
			  item.price_list_rate=r.message[0][1][0].price_list_rate
	          item.rate=r.message[0][1][0].price_list_rate
              let amount=r.message[0][1][0].price_list_rate
              console.log(item.margin_type)
	        
              
	          refresh_field("items")
	         
	   
	      })
    }
})

frappe.ui.form.on('Healthcare Item', "qty",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    
    item.amount=(item.qty)*(item.rate)
    item.discount_amount=0.0
    
     refresh_field("items")
})

frappe.ui.form.on('Healthcare Item', "discount_percentage",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    
    item.amount=(item.qty)*(item.rate)
    item.discount_amount=0.0
    item.discount_amount=item.rate*(item.discount_percentage/100)
    
    item.rate=item.rate-item.discount_amount
    item.amount=(item.qty)*(item.rate)
    refresh_field("items")
    
    
})

frappe.ui.form.on("Healthcare Item", {
        qty:function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var total = 0;
        frm.doc.items.forEach(function(d) { total += d.amount; });
        frm.set_value("grand_total", total);
        refresh_field("grand_total");
      },
        items_remove:function(frm, cdt, cdn){
        var d = locals[cdt][cdn];
        var total = 0;
        frm.doc.items.forEach(function(d) { total += d.amount; });
        frm.set_value("grand_total", total);
        refresh_field("grand_total");
            }
        });
frappe.ui.form.on("Healthcare Item", {
            discount_percentage:function(frm, cdt, cdn){
            var d = locals[cdt][cdn];
            var total = 0;
            frm.doc.items.forEach(function(d) { total += d.amount; });
            frm.set_value("grand_total", total);
            refresh_field("grand_total");
          },
            items_remove:function(frm, cdt, cdn){
            var d = locals[cdt][cdn];
            var total = 0;
            frm.doc.items.forEach(function(d) { total += d.amount; });
            frm.set_value("grand_total", total);
            refresh_field("grand_total");
                }
            });
frappe.ui.form.on("Healthcare Item", {
            qty:function(frm, cdt, cdn){
            var d = locals[cdt][cdn];
            var total = 0;
            frm.doc.items.forEach(function(d) { 
                refresh_field("amount");
                total += d.amount; });
            frm.set_value("grand_total", total);
            refresh_field("grand_total");
          },
            items_remove:function(frm, cdt, cdn){
            var d = locals[cdt][cdn];
            var total = 0;
            frm.doc.items.forEach(function(d) { total += d.amount; });
            frm.set_value("grand_total", total);
            refresh_field("grand_total");
                }
            });
frappe.ui.form.on("Sales Invoice","onload", function(frm){
    
            frm.set_query("patient", function() {
                return {
                    query: "patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.filter_patients"
                    
                };
            });
            })
frappe.ui.form.on("Sales Invoice","refresh", function(frm){
                if (frappe.boot.active_domains.includes("Healthcare")){
                frm.add_custom_button(__('Patient Encounter Items'), function() {
                    get_drugs_to_invoice(frm);
                },__("Fetch items From"));  } 
            })
frappe.ui.form.on("Sales Invoice", {
                on_submit: function(frm) {
                  var patient_name = frm.doc.patient 
                  frappe.call({
                    method:"patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.set_patient_status",
                    args:{patient_name:patient_name}
                }).done((r)=>{
                    console.log(r)
                })
                }
              });

var get_drugs_to_invoice = function(frm) {
                var me = this;
                let selected_encounter = '';
                var dialog = new frappe.ui.Dialog({
                    title: __("Get Items from Prescriptions"),
                    fields:[
                        { fieldtype: 'Link', options: 'Patient', label: 'Patient', fieldname: "patient", reqd: true },
                        { fieldtype: 'Link', options: 'Patient Encounter', label: 'Patient Encounter', fieldname: "encounter", reqd: true,
                            description:'Quantity will be calculated only for items which has "Nos" as UoM. You may change as required for each invoice item.',
                            get_query: function(doc) {
                                return {
                                    filters: {
                                        patient: dialog.get_value("patient"),
                                        company: frm.doc.company,
                                        docstatus: 1
                                    }
                                };
                            }
                        },
                        { fieldtype: 'Section Break' },
                        { fieldtype: 'HTML', fieldname: 'results_area' }
                    ]
                });
                var $wrapper;
                var $results;
                var $placeholder;
                dialog.set_values({
                    'patient': frm.doc.patient,
                    'encounter': ""
                });
                dialog.fields_dict["encounter"].df.onchange = () => {
                    var encounter = dialog.fields_dict.encounter.input.value;
                    if(encounter && encounter!=selected_encounter){
                        selected_encounter = encounter;
                        var method = "patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.get_items_to_invoice";
                        var args = {encounter: encounter};
                        var columns = (["drug_code", "quantity", "description"]);
                        get_healthcare_items(frm, false, $results, $placeholder, method, args, columns);
                    }
                    else if(!encounter){
                        selected_encounter = '';
                        $results.empty();
                        $results.append($placeholder);
                    }
                }
                $wrapper = dialog.fields_dict.results_area.$wrapper.append(`<div class="results"
                    style="border: 1px solid #d1d8dd; border-radius: 3px; height: 300px; overflow: auto;"></div>`);
                $results = $wrapper.find('.results');
                $placeholder = $(`<div class="multiselect-empty-state">
                            <span class="text-center" style="margin-top: -40px;">
                                <i class="fa fa-2x fa-heartbeat text-extra-muted"></i>
                                <p class="text-extra-muted">No Drug Prescription found</p>
                            </span>
                        </div>`);
                $results.on('click', '.list-item--head :checkbox', (e) => {
                    $results.find('.list-item-container .list-row-check')
                        .prop("checked", ($(e.target).is(':checked')));
                });
                set_primary_action(frm, dialog, $results, false);
                dialog.show();
            };
var get_healthcare_items = function(frm, invoice_healthcare_services, $results, $placeholder, method, args, columns) {
                var me = this;
                $results.empty();
                frappe.call({
                    method: method,
                    args: args,
                    callback: function(data) {
                        if(data.message){
                            $results.append(make_list_row(columns, invoice_healthcare_services));
                            for(let i=0; i<data.message.length; i++){
                                $results.append(make_list_row(columns, invoice_healthcare_services, data.message[i]));
                            }
                        }else {
                            $results.append($placeholder);
                        }
                    }
                });
            }