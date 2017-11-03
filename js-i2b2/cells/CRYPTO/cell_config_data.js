// this file contains a list of all files that need to be loaded dynamically for this i2b2 Cell
// every file in this list will be loaded after the cell's Init function is called
{
	files: [
	],
	// ONLY USE 1 STYLE SHEET: http://support.microsoft.com/kb/262161
	//css: ["main_list.css"],  
	config: {
		// additional configuration variables that are set by the system
		name: "Crypto",
		description: "The Crypto cell ensures sensitive data such as total_num is handled in a confidential and privacy-preserving way.",
		icons: {
			//size32x32: "ONT_icon_32x32.gif"
		},
		category: ["core","cell"],
		/*paramTranslation: [
			{xmlName:'OntMax', thinClientName:'max', defaultValue:500},
			{xmlName:'OntHiddens', thinClientName:'hiddens', defaultValue:false},
			{xmlName:'OntSynonyms', thinClientName:'synonyms', defaultValue:true}
		]*/
	}
}