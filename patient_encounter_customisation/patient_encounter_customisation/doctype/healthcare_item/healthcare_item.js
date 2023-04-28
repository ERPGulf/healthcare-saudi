
// get item details from item doctype
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
            //   console.log(item.margin_type)
	        
              
	          refresh_field("items")
	         
	   
	      })
    }
})
frappe.ui.form.on('Healthcare Item', "margin_rate_or_amount",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    var item_code=item.item_code
    item.discount_amount=0.0
    item.discount_percentage =0.0  
    console.log(item.rate)
    item.amount=(item.qty)*(item.rate)
    item.rate=item.rate - item.margin_rate_or_amount
    console.log(item.margin_rate_or_amount)
    item.amount=(item.qty)*(item.rate)
    refresh_field("items")
        
        
      
    
    
})
// Calculate total amount for product 
frappe.ui.form.on('Healthcare Item', "qty",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    
    item.amount=(item.qty)*(item.rate)
    item.discount_amount=0.0
    
     refresh_field("items")
})

// Calculate discount and apply them on total amount
frappe.ui.form.on('Healthcare Item', "discount_percentage",function(frm,cdt,cdn)
{
    let item=locals[cdt][cdn]
    var item_code=item.item_code
    
    // console.log(item_code)
    
    frappe.call({
        method: "frappe.client.get_value",
        args: {
        "doctype": "Item",
        "filters": {"item_code": item_code},
        "fieldname": "max_discount"
        }, callback: function(r) {
        let max_discount=r.message.max_discount
        
        if((item.discount_percentage <= max_discount))
        {
            // console.log(item.rate)
            item.margin_rate_or_amount =0.0
            item.amount=(item.qty)*(item.rate)
            item.discount_amount=0.0
            item.discount_amount=item.rate*(item.discount_percentage/100)
      
            item.rate=item.rate-item.discount_amount
            item.amount=(item.qty)*(item.rate)
            refresh_field("items")
        }
        else{
            frappe.msgprint(__('Maximum discount allowed is '+ max_discount));
        }
        }});

    
})

// Calculate the grand total amount when no discount added
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


// Calculate the grand total amount when  discount added or margin amount varied
frappe.ui.form.on("Healthcare Item", {
            discount_percentage :function(frm, cdt, cdn){
            var d = locals[cdt][cdn];
            var total = 0;
            frm.doc.items.forEach(function(d) { total += d.amount; });
            frm.set_value("grand_total", total);
            refresh_field("grand_total");
          },
          margin_rate_or_amount:function(frm, cdt, cdn){
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


// filter link field 
frappe.ui.form.on("Sales Invoice","onload", function(frm){
    
            frm.set_query("patient", function() {
                return {
                    query: "patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.filter_patients"
                    
                };
            });
            })

// adds custom button on the sales invoice form to get items from items table
frappe.ui.form.on("Sales Invoice","refresh", function(frm){
               
                frm.add_custom_button(__('Patient Encounter Items'), function() {
                    get_drugs_to_invoice(frm);
                },__("Fetch items From"));  
            })

var set_primary_action= function(frm, dialog, $results, invoice_healthcare_services) {
                var me = this;
                dialog.set_primary_action(__('Add'), function() {
                    let checked_values = get_checked_values($results);
                    if(checked_values.length > 0){
                        if(invoice_healthcare_services) {
                            frm.set_value("patient", dialog.fields_dict.patient.input.value);
                        }
                        frm.set_value("items", []);
                        add_to_item_line(frm, checked_values, invoice_healthcare_services);
                        dialog.hide();
                    }
                    else{
                        if(invoice_healthcare_services){
                            frappe.msgprint(__("Please select Healthcare Service"));
                        }
                        else{
                            frappe.msgprint(__("Please select Drug"));
                        }
                    }
                });
            };

var make_list_row= function(columns, invoice_healthcare_services, result={}) {
                var me = this;
                // Make a head row by default (if result not passed)
                let head = Object.keys(result).length === 0;
                let contents = ``;
                columns.forEach(function(column) {
                    contents += `<div class="list-item__content ellipsis">
                        ${
                            head ? `<span class="ellipsis">${__(frappe.model.unscrub(column))}</span>`
            
                            :(column !== "name" ? `<span class="ellipsis">${__(result[column])}</span>`
                                : `<a class="list-id ellipsis">
                                    ${__(result[column])}</a>`)
                        }
                    </div>`;
                })
            
                let $row = $(`<div class="list-item">
                    <div class="list-item__content" style="flex: 0 0 10px;">
                        <input type="checkbox" class="list-row-check" ${result.checked ? 'checked' : ''}>
                    </div>
                    ${contents}
                </div>`);
            
                $row = list_row_data_items(head, $row, result, invoice_healthcare_services);
                return $row;
            };   
var list_row_data_items = function(head, $row, result, invoice_healthcare_services) {
                if(invoice_healthcare_services){
                    head ? $row.addClass('list-item--head')
                        : $row = $(`<div class="list-item-container"
                            data-dn= "${result.reference_name}" data-dt= "${result.reference_type}" data-item= "${result.service}"
                            data-rate = ${result.rate}
                            data-income-account = "${result.income_account}"
                            data-discount-percent = "${result.discount}"
                            data-qty = ${result.qty}
                            data-description = "${result.description}">
                            </div>`).append($row);
                }
                else{
                    head ? $row.addClass('list-item--head')
                        : $row = $(`<div class="list-item-container"
                            data-item= "${result.drug_code}"
                            data-qty = ${result.quantity}
                            data-rate = ${result.rate}
                            data-discount-percent = ${result.discount}
                            data-discount-amount = ${result.discount_amount}
                            data-amount= ${result.amount}
                            data-description = "${result.description}">
                            </div>`).append($row);
                }
                return $row
            };        
var get_checked_values= function($results) {
                return $results.find('.list-item-container').map(function() {
                    // console.log($results)
                    let checked_values = {};
                    if ($(this).find('.list-row-check:checkbox:checked').length > 0 ) {
                        checked_values['dn'] = $(this).attr('data-dn');
                        checked_values['dt'] = $(this).attr('data-dt');
                        checked_values['item'] = $(this).attr('data-item');
                        // console.log(checked_values)
                        if($(this).attr('data-rate') != 'undefined'){
                            checked_values['rate'] = "45";
                        }
                        else{
                            checked_values['rate'] = false;
                        }
                        if($(this).attr('data-income-account') != 'undefined'){
                            checked_values['income_account'] = $(this).attr('data-income-account');
                        }
                        else{
                            checked_values['income_account'] = false;
                        }
                        if($(this).attr('data-qty') != 'undefined'){
                            checked_values['qty'] = $(this).attr('data-qty');
                        }
                        else{
                            checked_values['qty'] = false;
                        }
                        if($(this).attr('data-description') != 'undefined'){
                            checked_values['description'] = $(this).attr('data-description');
                        }
                        else{
                            checked_values['description'] = false;
                        }
                        if($(this).attr('data-discount_amount') != 'undefined'){
                            checked_values['discount_amount'] = $(this).attr('data-discount-amount');
                        }
                        else{
                            checked_values['discount_amount'] = false;
                        }
                        // console.log(checked_values)
                        return checked_values;
                    }
                }).get();
            };

// to check whether the patient is invoiced
frappe.ui.form.on("Sales Invoice", {
                on_submit: function(frm) {
                  var patient_name = frm.doc.patient 
                  frappe.call({
                    method:"patient_encounter_customisation.patient_encounter_customisation.doctype.healthcare_item.healthcare_item.set_patient_status",
                    args:{patient_name:patient_name}
                }).done((r)=>{
                    // console.log(r)
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
                        var columns = (["drug_code", "rate", "amount","qty","discount","discount_amount"]);
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
                // console.log($results)
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







            
var get_healthcare_items = function(frm, invoice_healthcare_services, $results, $placeholder, method, args, columns) {
	var me = this;
	$results.empty();
	frappe.call({
		method: method,
		args: args,
		callback: function(data) {
            // console.log(data.message)
			if(data.message){
				$results.append(make_list_row(columns, invoice_healthcare_services));
				for(let i=0; i<data.message.length; i++){
					$results.append(make_list_row(columns, invoice_healthcare_services, data.message[i]));
                    // console.log($results)
				}
			}else {
				$results.append($placeholder);
			}
		}
	});
}

var make_list_row= function(columns, invoice_healthcare_services, result={}) {
	var me = this;
    
	// Make a head row by default (if result not passed)
	let head = Object.keys(result).length === 0;
	let contents = ``;
	columns.forEach(function(column) {
		contents += `<div class="list-item__content ellipsis">
			${
				head ? `<span class="ellipsis">${__(frappe.model.unscrub(column))}</span>`

				:(column !== "name" ? `<span class="ellipsis">${__(result[column])}</span>`
					: `<a class="list-id ellipsis">
						${__(result[column])}</a>`)
			}
		</div>`;
	})

	let $row = $(`<div class="list-item">
		<div class="list-item__content" style="flex: 0 0 10px;">
			<input type="checkbox" class="list-row-check" ${result.checked ? 'checked' : ''}>
		</div>
		${contents}
	</div>`);

	$row = list_row_data_items(head, $row, result, invoice_healthcare_services);
    console.log(result)
	return $row;
};

var set_primary_action= function(frm, dialog, $results, invoice_healthcare_services) {
	var me = this;
    
	dialog.set_primary_action(__('Add'), function() {
		let checked_values = get_checked_values($results);
        // console.log(checked_values)
		if(checked_values.length > 0){
			if(invoice_healthcare_services) {
				frm.set_value("patient", dialog.fields_dict.patient.input.value);
			}
			frm.set_value("items", []);
			add_to_item_line(frm, checked_values, invoice_healthcare_services);
			dialog.hide();
		}
		else{
			if(invoice_healthcare_services){
				frappe.msgprint(__("Please select Healthcare Service"));
			}
			else{
				frappe.msgprint(__("Please select Drug"));
			}
		}
	});
};

var get_checked_values= function($results) {
	return $results.find('.list-item-container').map(function() {
		let checked_values = {};
		if ($(this).find('.list-row-check:checkbox:checked').length > 0 ) {
			checked_values['dn'] = $(this).attr('data-dn');
			checked_values['dt'] = $(this).attr('data-dt');
			checked_values['item'] = $(this).attr('data-item');
			if($(this).attr('data-rate') != 'undefined'){
				checked_values['rate'] = $(this).attr('data-rate');
			}
			else{
				checked_values['rate'] = false;
			}
			if($(this).attr('data-income-account') != 'undefined'){
				checked_values['income_account'] = $(this).attr('data-income-account');
			}
			else{
				checked_values['income_account'] = false;
			}
			if($(this).attr('data-qty') != 'undefined'){
				checked_values['qty'] = $(this).attr('data-qty');
			}
			else{
				checked_values['qty'] = false;
			}
			if($(this).attr('data-amount') != 'undefined'){
				checked_values['amount'] = $(this).attr('data-amount');
			}
			else{
				checked_values['amount'] = false;
			}
            if($(this).attr('data-discount-percent') != 'undefined'){
				checked_values['discount'] = $(this).attr('data-discount-percent');
			}
			else{
				checked_values['discount'] = false;
			}
            if($(this).attr('data-discount-amount') != 'undefined'){
				checked_values['discount_amount'] = $(this).attr('data-discount-amount');
			}
			else{
				checked_values['discount_amount'] = false;
			}
			return checked_values;
		}
	}).get();
};

// 

var list_row_data_items = function(head, $row, result, invoice_healthcare_services) {
	if(invoice_healthcare_services){
        
		head ? $row.addClass('list-item--head')
			: $row = $(`<div class="list-item-container"
				data-dn= "${result.reference_name}" data-dt= "${result.reference_type}" data-item= "${result.service}"
				data-rate = ${result.rate}
                data-discount-percent = "${result.discount}"
                data-discount-amount = "${result.discount_amount}"
				data-income-account = "${result.income_account}"
				data-qty = ${result.qty}
				data-amount = "${result.amount}">
				</div>`).append($row);
	}
	else{
        
		head ? $row.addClass('list-item--head')
			: $row = $(`<div class="list-item-container"
				data-item= "${result.drug_code}"
				data-rate = ${result.rate}
                data-qty = ${result.qty}
                data-discount-percent = ${result.discount}
                data-discount-amount = ${result.discount_amount}
				data-amount = "${result.amount}">
				</div>`).append($row);
	}
	return $row
};

var add_to_item_line = function(frm,checked_values){
	
		for(let i=0; i<checked_values.length; i++){
            
           console.log(checked_values)
            var si_item = frappe.model.add_child(frm.doc, 'Sales Invoice Item', 'items');
           
            
           
			frappe.model.set_value(si_item.doctype, si_item.name, 'item_code', checked_values[i]['item']);
            
           
            frappe.model.set_value(si_item.doctype, si_item.name, 'qty', parseFloat(checked_values[i]['qty']));
          
            frappe.ui.form.on('Sales Invoice Item','rate',function(frm,cdt,cdn)
            {
                let item=locals[cdt][cdn]
                
                
                frm.doc.items.forEach(function(d,i) { 
            console.log(i)
            
            d.discount_percentage=checked_values[i]['discount']
            d.discount_amount=d.price_list_rate*(d.discount_percentage/100)
            d.rate=checked_values[i]['rate']
            
            d.amount=checked_values[i]['amount']
            

            frm.refresh_fields("items"); 
        });
      
        frm.refresh_fields("items"); 
        frm.refresh_fields("total");
        frm.refresh_fields("taxes");
            })}
            
           
		
            
		
        
}

frappe.ui.form.on('Patient',"before_save",function(frm)
{
    
    var uid=frm.doc.uid
    if(uid){
    console.log(uid.length)
   if(uid.length < 10)
   {
    frappe.throw("Please enter a valid uid")
    
   }
}
})

frappe.ui.form.on('Patient',"before_save",function(frm,cdt,cdn)
{
    
    var mobile=frm.doc.mobile
    if(mobile){
    console.log(mobile.length)
   if(mobile.length < 10)
   {
    frappe.throw(("Please enter a valid mobile"));
   }}
})