class DummyORM {
  constructor(spreadSheetId){
    this.spreadSheet = SpreadsheetApp.openById(spreadSheetId);
  }

  /**
   * @param{string} - sheetName
   * @where{object} - conditions
   * @returns{object[]} - e.g) [{id: 123, name: taro, age: 18}, {}, ... , {}]
   */
  findMany(sheetName, where={}){
    // get the target data list
    const range = this.spreadSheet.getSheetByName(sheetName).getDataRange();
    const dataMatrix = range.getValues();

    if(dataMatrix.length === 0){
      Logger.log('Fatal Error: No values found!');
      return [];
    }

    // split keys and data
    const keys = dataMatrix[0]; // [id, title, content, ...]
    const dataRows = dataMatrix.slice(1);    // properties: [ [1, 'hello', 'yeah hello days', ...], [], [], [], ... [] ]

    const dataObjectList = [];

    // convert each row into an object
    for(const dataList of dataRows){
      const dataObject = {};

      for(let i=0; i<keys.length; i++){
        const key = keys[i];
        const datum = dataList[i];
        dataObject[key] = datum;
      }

      if(!objectMatchesCondition(dataObject, where)){
        continue;
      }

      dataObjectList.push(dataObject);
    }

    return dataObjectList;
  }

  /**
   * @param{string} - sheetName
   * @where{object} - conditions
   * @returns{object | null} - e.g) {id: 123, name: taro, age: 18}
   */
  findUnique(sheetName, where){
    // get the target data list
    const range = this.spreadSheet.getSheetByName(sheetName).getDataRange();
    const dataMatrix = range.getValues();

    if(dataMatrix.length === 0){
      Logger.log('Fatal Error: No values found!');
      return null;
    }

    // split keys and data
    const keys = dataMatrix[0]; // [id, title, content, ...]
    const dataRows = dataMatrix.slice(1);    // properties: [ [1, 'hello', 'yeah hello days', ...], [], [], [], ... [] ]

    // convert each row into an object
    for(const dataList of dataRows){
      const dataObject = {};

      for(let i=0; i<keys.length; i++){
        const key = keys[i];
        const datum = dataList[i];
        dataObject[key] = datum;
      }

      if(!objectMatchesCondition(dataObject, where)){
        continue;
      }

      return dataObject;
    }

    Logger.log("Error: datum is not found");
    return null;
  }

  /**
   * convert datum object to list and save into sheet
   * @param{string} - sheetName
   * @param{object} - datum
   */
  create(sheetName, datum){
    const sheet = this.spreadSheet.getSheetByName(sheetName);
    const dataRange = sheet.getDataRange();
    const colLength = dataRange.getNumColumns();
    const rowToInsert = dataRange.getLastRow() + 1;

    const keys = sheet.getRange(1, 1, 1, colLength).getValues()[0];
    const sanitizedDatum = sanitizeDatum(datum);
    const dataList = objectToList(sanitizedDatum, keys);
    
    sheet.getRange(rowToInsert, 1, 1, colLength).setValues([dataList]);
    Logger.log(`Create new data: ${JSON.stringify(dataList)}`);
  }

  /**
   * @param{string} - sheetName
   * @param{object} - entire datum to update
   * @param{string} - key to define the datum to update
   */
  update(sheetName, datum, key="id"){
    const sheet = this.spreadSheet.getSheetByName(sheetName);
    const dataRange = sheet.getDataRange();
    const colLength = dataRange.getNumColumns();

    const keys = sheet.getRange(1, 1, 1, colLength).getValues()[0];
    const keyIndex = keys.indexOf(key);

    if(keyIndex === -1){
      Logger.log(`Failed to find key: ${key}`);
      return;
    }

    // Key is Found
    const rowLength = dataRange.getNumRows();
    const keyProperties = sheet.getRange(2, keyIndex+1, rowLength-1, 1).getValues(); 
    const sanitizedDatum = sanitizeDatum(datum);
    const keyValue = sanitizedDatum[key];

    let rowToInsert = -1;
    for(let i=0; i<keyProperties.length; i++){
      if(keyProperties[i][0] === keyValue){
        rowToInsert = i + 2;
        break;
      }
    }

    if(rowToInsert === -1){
      this.create(sheetName, sanitizedDatum);
      Logger.log(`Failed to find existing data with key value: ${keyValue}. Created new one.`);
      return;
    }

    // Update the existing row
    const dataList = objectToList(sanitizedDatum, keys);
    sheet.getRange(rowToInsert, 1, 1, colLength).setValues([dataList]);
    Logger.log(`Update existing data ${JSON.stringify(dataList)}`);
  }

  /**
   * delete one datum which is matched the condition
   * @param{string} - sheetName
   * @param{object} - where
   */
  delete(sheetName, where){
    // get target data list
    let sheet = this.spreadSheet.getSheetByName(sheetName);
    if(!sheet){
      Logger.log(`Sheet is not defined for: ${sheetName}`);
      return;
    }

    const dataMatrix = sheet.getDataRange().getValues();
    if(!dataMatrix || dataListList.length < 2){
      Logger.log('Fatal Error: No values found!');
      return;
    }

    // split keys and data
    const keys = dataMatrix[0]; // [id, title, content, ...]

    // convert
    for(let i=1; i<dataMatrix.length; i++){
      const dataList = dataMatrix[i];
      const dataObject = {};

      for(let j=0; j<keys.length; j++){
        const key = keys[j];
        dataObject[key] = dataList[j];
      }

      if(objectMatchesCondition(dataObject, where)){
        try{
          sheet.deleteRow(i+1);
          Logger.log(`Deleted column: ${i+1}`);
        }catch(err){
          Logger.log(`Failed to delete: ${i+1}: ${err.message}`);
        }      
        return;
      }
    }
    Logger.log('No matching row found.');
  }
}

this.ORM = DummyORM;