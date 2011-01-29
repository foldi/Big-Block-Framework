/**
 * Database object
 * Provides an interface to read/write values to the browser's local storage area. Browser must be HTML 5 compliant.
 * 
 * @author Vince Allen 12-27-2010
 * 
 * Big Block Framework
 * Copyright (C) 2011 Foldi, LLC
 * 
 */

BigBlock.Database = (function () {

	var supported = true;

	if (typeof(window.openDatabase) === "undefined") {
		supported = false;
		BigBlock.Log.display("This browser does not support a local database.");
	}	
		
	return {
		
		supported: supported,
		alias: "database",
		my_results: null,
		/**
		 * Returns a value in the localStorage.
		 * 
		 * @param {String} key
		 */				
		open: function(shortName) {
			
			try {
				if (typeof(shortName) === "undefined") {
					throw new Error("Database.open(): shortName argument required");
				}						
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
			
			try {
			    if (supported === true) {
			        this.shortName = shortName;
			        this.version = "1.0";
			        this.displayName = "Database: " + shortName;
			        this.maxSize = 65536; // in bytes
			        this.db = openDatabase(this.shortName, this.version, this.displayName, this.maxSize); // the database instance
			    }
			} catch(e) {
				BigBlock.Log.display(e.name + ": " + e.message);
			}
			
		},
		/**
		 * Create a database table.
		 * 
		 * @param {String} sql
		 * 
		 */				
		createTable: function(sql) {
			
			if (this.supported === true) {
				
				try {
					if (typeof(sql) === "undefined") {
						throw new Error("Database.createTable(): sql argument required");
					}						
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
							
				if (typeof(this.db) !== "undefined") {
					this.db.transaction(function(transaction){
						/* The first query causes the transaction to (intentionally) fail if the table exists. */
						transaction.executeSql(sql, [], BigBlock.Database.nullDataHandler, BigBlock.Database.errorHandler);
					});
				}
			
			}			
			
		},
		/**
		 * Executes sql query.
		 * 
		 * @param {String} sql
		 * 
		 */				
		executeSql: function(sql){
			
			if (this.supported === true) {

				try {
					if (typeof(sql) === "undefined") {
						throw new Error("Database.executeSql(): sql argument required");
					}						
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}
								
				if (typeof(this.db) !== "undefined") {
					this.db.transaction(function(transaction){
						transaction.executeSql(sql, [], // array of values for the ? placeholders
						BigBlock.Database.dataHandler, BigBlock.Database.errorHandler);
					});
				}	
			
			}
			
		},
		/**
		 * Inserts data.
		 * 
		 * @param {String} table
		 * @param {String} fields
		 * @param {Array} values
		 * 
		 */				
		executeSqlInsert: function(table, fields, values) {
			
			if (this.supported === true) {

				try {
					if (typeof(table) === "undefined") {
						throw new Error("Database.executeSqlInsert(): table argument required");
					}
					if (typeof(fields) === "undefined") {
						throw new Error("Database.executeSqlInsert(): fields argument required");
					}
					if (typeof(values) === "undefined") {
						throw new Error("Database.executeSqlInsert(): values argument required");
					}
					if (typeof(this.db) === "undefined") {
						throw new Error("Database.executeSqlInsert(): database does not exist");
					}																					
				} catch(e) {
					BigBlock.Log.display(e.name + ": " + e.message);
				}				
				
				this.db.transaction(function(transaction) {
					
					var i, value_placeholders;
					
					if (fields.indexOf(",") !== -1) {
						
						value_placeholders = "";
						
						for (i = 0; i < fields.split(",").length; i++) { // get string of ?'s based on number of fields
							if (i === fields.split(",").length - 1) {
								value_placeholders = value_placeholders + "?";
							}
							else {
								value_placeholders = value_placeholders + "?,";
							}
						}
					
					} else {
						value_placeholders = "?";
					}
					var sql = "INSERT into " + table + " (" + fields + ") VALUES ( " + value_placeholders + " );";
					
					transaction.executeSql(sql, 
					values, // array of values for the ? placeholders
					BigBlock.Database.nullDataHandler, BigBlock.Database.errorHandler);
				});

			}		
			
		},		
		dataHandler: function (transaction, results) { // callbacks do NOT have access to 'this'
		    BigBlock.Database.results = results;
		},				
		/**
		 * Function called when no data is returned.
		 * 
		 */				
		nullDataHandler: function (transaction, results) {
			 
		},
		/**
		 * Function called on error.
		 * 
		 */				
		errorHandler: function (transaction, error) {
			 BigBlock.Log.display(error.code + ": " + error.message);
		}		
		
	};
	
})();