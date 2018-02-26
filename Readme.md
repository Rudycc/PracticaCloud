# Prectica 1 Cloud
### Alumno
 * Nombre: Rodolfo Carrillo Cuevas
 * Expediente: Is700829

 #### Tareas Completadas
  * Fase 1 Completada
  * Fase 2 Completada
  * Fase 3 Completada
  * Fase 4 Completada
 
 #### Lógica de app.js
  Aqui es donde se obtiene el request que se hace a /search/:word.
  Lo primero que se hace es pasar el témino por el stemmer
  ```
  app.get('/search/:word', function(req, res) {
  const stemmedword = stemmer(req.params.word); //stem the word
  console.log("Stemmed word: "+stemmedword);
  ```
  Una vez que se tiene el término se manda llamar el método get de la tabla de terms. Una vez que se tienen los datos se revisa que no sean nulos, si no hay resultados entonces se responde que no hay resultados

  ```
  terms.get(stemmedword)
  .then(data => {
    if (data == null || data.length === 0) {
      console.log("getAttributes() returned no results");
      res.send(JSON.stringify({results: [], num_results: 0, error: undefined}));
    }
  ```

  En caso contrario se manda llamar al get de cada imagen y se guardan las promesas en un arreglo. Con el Promise.all se espera a que se resuelvan todas las promesas, una vez que las tenemos se descompone cada objeto para obtener unicamente el value y se responde con el arreglo de values y la cantidad. En caso de error se responde con un error.
  ```
  else {
      let promises = data.map(attribute => images.get(attribute.value))

      Promise.all(promises).then(foundImages => {
        let results = foundImages.map(([{value}]) => value)
        res.send(JSON.stringify({results, num_results: results.length, error: undefined}));
      }).catch(console.log)
    }
  }).catch(err => {
    console.log("getAttributes() failed: "+err);
    res.send(JSON.stringify({results: undefined, num_results: 0, error: err}));
  })
  ```


 #### Lógica de KeyValueStore.js
  En el init se revisa primero si la tabla existe
  ```
  keyvaluestore.prototype.init = function(whendone){
    const tableName = this.tableName;
    db2.describeTable({TableName: this.tableName}).promise().then(whendone).catch(console.log)
  };
  ```

  En el método de get se regresa una promesa, en caso de que que ocurra algun error se manda llamar a reject con dicho error. Antes de hacer la llamada a la API se revisa si el término que se desea buscar se encuentra en la cache, de ser asi se regresa lo que esta en cache.
  ```
  if (this.cache.get(search)){
        console.log('in cache', this.cache.get(search))
        resolve(this.cache.get(search))
      }
  ```
  En caso de no estar en cache se busca en dynamodb, se agrega a la cache y se resuleve la promesa con el resultado.
  ```
  db.query(params).promise().then(data => {
          let items = data.Items.map(({ inx, value, keyword: key }) => ({ inx, value, key,}))
          this.cache.set(search, items)
          resolve(items)
        }).catch(reject)
  ```
