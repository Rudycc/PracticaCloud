  const AWS = require('aws-sdk');
  AWS.config.loadFromPath('./config.json');

  //Este simplifica la estructura que deben llevar las llamadas a Dynamo, asi como la estructura de la respuesta
  const db = new AWS.DynamoDB.DocumentClient();
  //Utilizado para revisar si la tabla existe
  const db2 = new AWS.DynamoDB()

  function keyvaluestore(table) {
    this.LRU = require("lru-cache");
    this.cache = this.LRU({ max: 500 });
    this.tableName = table;
  };

  /**
   * Initialize the tables
   * 
   */
  keyvaluestore.prototype.init = function(whendone){
    const tableName = this.tableName;
    db2.describeTable({TableName: this.tableName}).promise().then(whendone).catch(console.log)
  };

  /**
   * Get result(s) by key
   * 
   * @param search
   * 
   * Callback returns a list of objects with keys "inx" and "value"
   */
  
keyvaluestore.prototype.get = function(search) {
    return new Promise((resolve, reject) => {
      if (this.cache.get(search)){
        console.log('in cache', this.cache.get(search))
        resolve(this.cache.get(search))
      }
      else {
        const params = {
          TableName : this.tableName,
          KeyConditionExpression: "#kw = :value",
          ExpressionAttributeNames:{
            "#kw": "keyword"
          },
          ExpressionAttributeValues: {
            ":value": search
          }
        }

        db.query(params).promise().then(data => {
          //Descomponer cada objeto del arreglo y construir nuevo objeto con los atributos necesarios
          let items = data.Items.map(({ inx, value, keyword: key }) => ({ inx, value, key,}))
          this.cache.set(search, items)
          resolve(items)
        }).catch(reject)
      }
    })
  }

  module.exports = keyvaluestore;
