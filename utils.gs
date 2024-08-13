/**
 * @param{object} - object
 * @param{condition} - condition
 * @return{boolean} - if this is required item or not
 */
function objectMatchesCondition(object, condition) {
  const keys = Object.keys(condition);

  // No conditions provided, so it always matches
  if (keys.length === 0) {
    return true;
  }

  for (const key of keys) {
    if (object[key] !== condition[key]) {
      return false;
    }
  }

  return true;
}

/**
 * To avoid abuse or unexpected errors
 * @param{object} - datum e.g) {id: 123, name: Taro }
 */
function sanitizeDatum(datum) {
  const sanitizedDatum = { ...datum };
  const keys = Object.keys(sanitizedDatum);

  for (const key of keys) {
    if (typeof sanitizedDatum[key] === "string") {
      sanitizedDatum[key] = sanitizeInput(sanitizedDatum[key]);
    }
  }

  return sanitizedDatum;
}

/**
 * @param {Object} object - {id: 1020, name: 'moe'}
 * @param {string[]} keys - [name, id]
 * @return {string[] | number[]} - ['moe', 1020]
 */
function objectToList(object, keys){
  const outputList = [];

  for(const key of keys){
    if(object.hasOwnProperty(key)){
      outputList.push(object[key]);
    }else{
      outputList.push(null);
    }
  }

  return outputList;
}