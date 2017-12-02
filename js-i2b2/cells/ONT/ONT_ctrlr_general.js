/**
 * @projectDescription	Event controller for general ONT functionality.
 * @inherits 	i2b2.ONT.ctrlr
 * @namespace	i2b2.ONT.ctrlr.FindBy
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: ONT > ctrlr > general');
console.time('execute time');

window.queryPoint = function(){
	var node = i2b2.ONT.view.nav.current;
	var key = node.data.i2b2_SDX.sdxInfo.sdxKeyValue;
	i2b2.CRYPTO.distribution="point";
	i2b2.ONT.ctrlr.gen.getTotalNums(key);
}
window.queryCumulative = function(){
	var node = i2b2.ONT.view.nav.current;
	var key = node.data.i2b2_SDX.sdxInfo.sdxKeyValue;
	i2b2.CRYPTO.distribution="cumulative";
	i2b2.ONT.ctrlr.gen.getTotalNums(key);
}

window.queryAll = function(){
	var node = i2b2.ONT.view.nav.current;
	var key = node.data.i2b2_SDX.sdxInfo.sdxKeyValue;
	i2b2.CRYPTO.distribution="point";
	i2b2.ONT.ctrlr.gen.getTotalNums(key);
}

i2b2.ONT.ctrlr.gen = new Object;
// ================================================================================================== //
i2b2.ONT.ctrlr.gen.loadCategories = function() {
	console.info("CALLED i2b2.ONT.ctrlr.gen.loadCategories()");
	// THIS FUNCTION DOES THE FOLLOWING:
	//	1) fires a call to ajax.getCategories(), 
	//	2) interprets the XML / populates the ONT data model, 
	//	3) fires it's onDataUpdate event


	// make sure the categories section of the data model exists
	if (!i2b2.ONT.model.Categories) { i2b2.ONT.model.Categories = []; }
	// define the XML processing function
	var processXML = function(i2b2CellMsg) {
		console.group("CALLBACK Processing AJAX i2b2CellMsg");
		console.dir(i2b2CellMsg);
		// the THIS scope is already set to i2b2.ONT.model.Categories
		this.clear();
		i2b2.ONT.view.nav.queryResponse = i2b2CellMsg.msgResponse;
		i2b2.ONT.view.nav.queryRequest = i2b2CellMsg.msgRequest;
		if (!i2b2CellMsg.error) {		
			var c = i2b2CellMsg.refXML.getElementsByTagName('concept');
			for(var i=0; i<1*c.length; i++) {
				var o = new Object;
				o.xmlOrig = c[i];
				o.name = i2b2.h.getXNodeVal(c[i],'name');
				o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
				o.level = i2b2.h.getXNodeVal(c[i],'level');
				o.key = i2b2.h.getXNodeVal(c[i],'key');
				o.tooltip = i2b2.h.getXNodeVal(c[i],'tooltip');
				o.icd9 = '';
				o.table_name = i2b2.h.getXNodeVal(c[i],'tablename');
				o.column_name = i2b2.h.getXNodeVal(c[i],'columnname');
				o.operator = i2b2.h.getXNodeVal(c[i],'operator');
				o.dim_code = i2b2.h.getXNodeVal(c[i],'dimcode');
				// save the node to the ONT data model
				this.push(o);
			}
		} else {
			alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
		}
		// Broadcast an update event letting interested view controllers know that the Categories data model has been updated
		var DataUpdateSignal = {
			DataLocation: "i2b2.ONT.model.Categories",
			DataRef: i2b2.ONT.model.Categories
		}
		console.info("EVENT FIRE i2b2.ONT.ctrlr.gen.events.onDataUpdate; Msg:",DataUpdateSignal);
		console.groupEnd();
		i2b2.ONT.ctrlr.gen.events.onDataUpdate.fire(DataUpdateSignal);
	};
	// create a scoped callback message to pass the XML to our function defined above
	var scopeCB = new i2b2_scopedCallback(processXML,i2b2.ONT.model.Categories);
	// fire the AJAX call
	var options = {}
	options.ont_hidden_records = i2b2.ONT.view['nav'].params.hiddens
	options.ont_synonym_records = i2b2.ONT.view['nav'].params.synonyms	
	i2b2.ONT.ajax.GetCategories("ONT:generalView", options, scopeCB);
}

// ================================================================================================== //
i2b2.ONT.ctrlr.gen.getTotalNums = function(key) {
	console.info("CALLED i2b2.ONT.ctrlr.gen.getTotalNums()");
	var processXML = function(i2b2CellMsg) {
		i2b2.ONT.view.nav.queryResponse = i2b2CellMsg.msgResponse;
		i2b2.ONT.view.nav.queryRequest = i2b2CellMsg.msgRequest;
		if (!i2b2CellMsg.error) {
			var locations = {};
			var timesPerLocation = {};
			var totalnumsPerLocation = {};
			var c = i2b2CellMsg.refXML.getElementsByTagName('totalnum_group');
			for(var i=0; i<1*c.length; i++) {
				location_cd = i2b2.h.getXNodeVal(c[i],'location');
				if(!locations[location_cd]){
					locations[location_cd] = "x"+i;
				}
				if(i2b2.CRYPTO.distribution=="point"){
					time = i2b2.h.getXNodeVal(c[i],'time');
					if(!timesPerLocation[locations[location_cd]]){
						timesPerLocation[locations[location_cd]] = [locations[location_cd],time];
					}else{
						timesPerLocation[locations[location_cd]].push(time);
					}
				}
				tn = i2b2.h.getXNodeVal(c[i],'totalnum');
				totalnum = DecryptInt(tn,i2b2.CRYPTO.privatekey);
				if(!totalnumsPerLocation[location_cd]){
					totalnumsPerLocation[location_cd] = [location_cd,totalnum];
				}else{
					totalnumsPerLocation[location_cd].push(totalnum);
				}
			}
			columns = []
			for (var property in timesPerLocation) {
			    if (timesPerLocation.hasOwnProperty(property)) {
			        columns.push(timesPerLocation[property])
			    }
			}
			for (var property in totalnumsPerLocation) {
			    if (totalnumsPerLocation.hasOwnProperty(property)) {
			        columns.push(totalnumsPerLocation[property])
			    }
			}
			if(i2b2.CRYPTO.distribution=="point"){
				window.readypoint = true;
				window.dataObjPoint = {"xs":locations,"columns":columns};
				var aggrColumns = [];
				for (var property in totalnumsPerLocation){
					if(totalnumsPerLocation.hasOwnProperty(property)){
						var array = totalnumsPerLocation[property]
						var sum =array.slice(1).reduce(add, 0);
						function add(a, b) {
						   return a + b;
						}
						aggrColumns.push([array[0],sum]);
					}
				}
				window.readycumulative = true;
				window.dataObjCumulative = {"columns":aggrColumns,"type":'bar'};
			}else{
				window.readycumulative = true;
				window.dataObjCumulative = {"columns":columns,"type":'bar'};
			}
			i2b2.CRYPTO.stats = window.open('js-i2b2/cells/ONT/stats.html',"Stats",'width=1400,height=800');
		} else {
			alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
		}
	};
	var scopeCB = new i2b2_scopedCallback(processXML,null);
	var options = {};
	options.ont_hidden_records = i2b2.ONT.view['nav'].params.hiddens;
	options.ont_synonym_records = i2b2.ONT.view['nav'].params.synonyms;
	options.concept_key_value = key;
	i2b2.CRYPTO.currentConceptPath = key;
	i2b2.ONT.cfg.msgs.GetTotalNums = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+
	'<ns3:request xmlns:ns3="http://www.i2b2.org/xsd/hive/msg/1.1/" xmlns:ns4="http://www.i2b2.org/xsd/cell/ont/1.1/" xmlns:ns2="http://www.i2b2.org/xsd/hive/plugin/">\n'+
	'    <message_header>\n'+
	'        {{{proxy_info}}}'+
	'        <i2b2_version_compatible>1.1</i2b2_version_compatible>\n'+
	'        <hl7_version_compatible>2.4</hl7_version_compatible>\n'+
	'        <sending_application>\n'+
	'            <application_name>i2b2 Ontology </application_name>\n'+
	'            <application_version>{{{version}}}</application_version>\n'+
	'        </sending_application>\n'+
	'        <sending_facility>\n'+
	'            <facility_name>i2b2 Hive</facility_name>\n'+
	'        </sending_facility>\n'+
	'        <receiving_application>\n'+
	'            <application_name>Ontology Cell</application_name>\n'+
	'            <application_version>{{{version}}}</application_version>\n'+
	'        </receiving_application>\n'+
	'        <receiving_facility>\n'+
	'            <facility_name>i2b2 Hive</facility_name>\n'+
	'        </receiving_facility>\n'+
	'        <datetime_of_message>{{{header_msg_datetime}}}</datetime_of_message>\n'+
	'		<security>\n'+
	'			<domain>{{{sec_domain}}}</domain>\n'+
	'			<username>{{{sec_user}}}</username>\n'+
	'			{{{sec_pass_node}}}\n'+
	'		</security>\n'+
	'        <message_control_id>\n'+
	'            <message_num>{{{header_msg_id}}}</message_num>\n'+
	'            <instance_num>0</instance_num>\n'+
	'        </message_control_id>\n'+
	'        <processing_id>\n'+
	'            <processing_id>P</processing_id>\n'+
	'            <processing_mode>I</processing_mode>\n'+
	'        </processing_id>\n'+
	'        <accept_acknowledgement_type>AL</accept_acknowledgement_type>\n'+
	'        <application_acknowledgement_type>AL</application_acknowledgement_type>\n'+
	'        <country_code>US</country_code>\n'+
	'        <project_id>{{{sec_project}}}</project_id>\n'+
	'    </message_header>\n'+
	'    <request_header>\n'+
	'        <result_waittime_ms>{{{result_wait_time}}}000</result_waittime_ms>\n'+
	'    </request_header>\n'+
	'    <message_body>\n'+
	'        <ns4:get_children blob="false" type="core" {{{ont_max_records}}} synonyms="{{{ont_synonym_records}}}" hiddens="{{{ont_hidden_records}}}">\n'+
	'            <concept>{{{concept_key_value}}}</concept>\n'+
	'            <pubkey>'+i2b2.CRYPTO.publickey+'</pubkey>\n'+
	'            <fromtime>'+i2b2.CRYPTO.fromTime+'</fromtime>\n'+
	'            <totime>'+i2b2.CRYPTO.toTime+'</totime>\n'+
	'            <distribution>'+i2b2.CRYPTO.distribution+'</distribution>\n'+
	'        </ns4:get_children>\n'+
	'    </message_body>\n'+
	'</ns3:request>';
	i2b2.ONT.ajax._addFunctionCall(	"GetTotalNums",
								"http://localhost:9090/i2b2/services/CryptoService/getTotalNums",
								i2b2.ONT.cfg.msgs.GetTotalNums,
								null,
								i2b2.ONT.cfg.parsers.ExtractTotalNums);
	i2b2.ONT.ajax.GetTotalNums("ONT:generalView", options, scopeCB);
}

// ================================================================================================== //
i2b2.ONT.ctrlr.gen.loadSchemes = function() {
	console.info("CALLED i2b2.ONT.ctrlr.gen.loadSchemes()");
	// THIS FUNCTION DOES THE FOLLOWING:
	//	1) fires a call to ajax.getCategories(), 
	//	2) interprets the XML / populates the ONT data model, 
	//	3) fires it's onDataUpdate event

	// make sure the schemes section of the data model exists
	if (!i2b2.ONT.model.Schemes) { i2b2.ONT.model.Schemes = []; }
	// define the XML processing function
	var processXML = function(i2b2CellMsg) {
		console.group("CALLBACK Processing AJAX i2b2CellMsg");
		console.dir(i2b2CellMsg);
		// the THIS scope is already set to i2b2.ONT.model.Categories
		this.clear();
		i2b2.ONT.view.nav.queryResponse = i2b2CellMsg.msgResponse;
		i2b2.ONT.view.nav.queryRequest = i2b2CellMsg.msgRequest;
		if (!i2b2CellMsg.error) {		
			var c = i2b2CellMsg.refXML.getElementsByTagName('concept');
			for(var i=0; i<1*c.length; i++) {
				var o = new Object;
				o.name = i2b2.h.getXNodeVal(c[i],'name');
				o.key = i2b2.h.getXNodeVal(c[i],'key');
				// save the node to the ONT data model
				i2b2.ONT.model.Schemes.push(o);
			}
		} else {
			alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
		}
		// Broadcast an update event letting interested view controllers know that the Categories data model has been updated
		var DataUpdateSignal = {
			DataLocation: "i2b2.ONT.model.Schemes",
			DataRef: i2b2.ONT.model.Schemes
		}
		console.info("EVENT FIRED i2b2.ONT.ctrlr.gen.events.onDataUpdate");
		console.dir(DataUpdateSignal);
		console.groupEnd();
		i2b2.ONT.ctrlr.gen.events.onDataUpdate.fire(DataUpdateSignal);
	};
	// create a scoped callback message to pass the XML to our function defined above
	var scopeCB = new i2b2_scopedCallback(processXML,i2b2.ONT.model.Schemes);
	// fire the AJAX call
	i2b2.ONT.ajax.GetSchemes("ONT:generalView", {}, scopeCB);
}


// signal that is fired when the ONT cell's data model is updated
// ================================================================================================== //
i2b2.ONT.ctrlr.gen.events = new Object;
i2b2.ONT.ctrlr.gen.events.onDataUpdate = new YAHOO.util.CustomEvent("DataUpdate", i2b2.ONT);


// after the cell is initialized 
// ================================================================================================== //
i2b2.events.afterCellInit.subscribe(
	(function(en,co,a) {
		if (co[0].cellCode=='ONT') {
			i2b2.ONT.ctrlr.gen.loadCategories(); 	// load categories into the data model
			i2b2.ONT.ctrlr.gen.loadSchemes();		// load categories into the data model
		}
	})
);

console.timeEnd('execute time');
console.groupEnd();
