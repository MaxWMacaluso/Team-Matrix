const getImg = (body) => {
    return new Promise(function(resolve, reject) {
      var { profile_id } = body
      if (profile_id === 'null' ) {
        profile_id = '1 OR 1 = 1'
      }
      pool.query(`SELECT * FROM image WHERE profile_id = ${profile_id}`, (error, results) => {
        if (error) {
          reject(error)
        }
        //console.log(results)
        resolve(results.rows);
        console.log(results.rows);
      })
    })
  }
  
  const createImg = (body) => {
    return new Promise(function(resolve, reject) {
      const { img_source, img_transform, img_transform_origin, profile_id } = body
      // pool.query("SELECT * FROM image;", (error, results) => {
      // pool.query("ALTER TABLE image ALTER COLUMN img_transform TYPE varchar(500);", (error, results) => {
      pool.query('INSERT INTO image (img_source, img_transform, img_transform_origin, profile_id) VALUES ($1, $2, $3, $4) RETURNING *', [ img_source, img_transform, img_transform_origin, profile_id], (error, results) => {
        if (error) {
          reject(error)
          console.log(error);
        }
        // console.log(results.rows);
  
        resolve('A new image has been added added: ${results.rows}')
      })
    })
  }
  
  const updateImageTransforms = (body) => {
    return new Promise(function(resolve, reject) {
      var images = body
      console.log(body);
      var updateString = "";
      // updateString +=     "ALTER TABLE image ALTER COLUMN img_transform TYPE varchar(500);"
  
      for (var i = 0; i < images.length; i++) {
        updateString += `UPDATE image SET img_transform = '${images[i].img_transform}', img_transform_origin = '${images[i].img_transform_origin}' WHERE img_id = ${images[i].img_id};`
      }
  
      console.log(updateString)
  
      // pool.query("ALTER TABLE image ALTER COLUMN img_source TYPE varchar(1000);", (error, results) => {
      pool.query(updateString, (error, results) => {
        if (error) {
          reject(error)
        }
  
        resolve('Updated! ${results.rows}')
      })
    })
  }
  
  const deleteImg = (img_id) => {
    return new Promise(function(resolve, reject) {
      pool.query('DELETE FROM image WHERE img_id = $test', [img_id], (error, results) => {
        if (error) {
          reject(error)
        }
        resolve('Image deleted with name: ${img_id}')
      })
    })
  }
  
  module.exports = {
    getImg,
    createImg,
    deleteImg,
    updateImageTransforms
  }