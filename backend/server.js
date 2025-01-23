const express = require('express');
const sql = require('mssql');
const app = express();

const config = {
    user: 'otistikselen', // SQL Server Authentication kullanıcı adı
    password: 'selen123.', // SQL Server Authentication şifresi
    server: 'DESKTOP-3CUMV3H',
    database: 'PetApp',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: 1433
};

async function testConnection() {
    try {
        let pool = await sql.connect(config);
        console.log("Bağlantı başarılı!");
        const result = await pool.request().query('SELECT @@VERSION AS Version');
        console.log('SQL Server Version:', result.recordset[0].Version);
    } catch (err) {
        console.error("Bağlantı hatası:", err);
    } finally {
        sql.close();
    }
}

testConnection();



app.get('/api/test', async (req, res) => {
  try {
      let pool = await sql.connect(config);
      const result = await pool.request().query('SELECT * FROM Users');
      res.json(result.recordset);
  } catch (err) {
      res.status(500).send(err.message);
  } finally {
      sql.close();
  }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});