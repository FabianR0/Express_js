const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@libsql/client');
const app = express();
const cors = require('cors'); 

const { body, validationResult } = require('express-validator');
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = createClient({
    url: "libsql://cliente01-fabian-0.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MTI5NzUyNTcsImlkIjoiZWY0YjdiY2MtYTI2Yi00MjU0LWExOGQtMjQzYmY3MzlmNGJjIn0.sMkqIWCBOMSFFVsAvizXwjO925Gj-lmT9udmxk7Oal5hHvmnUeUEQiAhxp7h86ustUz_yKCrZvywKx_y0DInCw",
});

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.json({
        "Title": "API works"
    });
});

app.get('/products', async (req, res) => {
    const result = await db.execute("SELECT * FROM contacts;");
    // Convertir BigInt a String antes de enviar la respuesta
    const rowsWithStrings = result.rows.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });
    res.json(rowsWithStrings);
});

app.post('/products', async (req, res) => {
    console.log(req.body);
    const value = await db.execute(`INSERT INTO contacts ( title , description , price , images) VALUES ('${req.body.title}', '${req.body.description}', '${req.body.price}', '${req.body.images}');`);
    res.json({ "message": value.lastInsertRowid.toString()});
}); 

app.put('/products/:id', async (req, res) => {
    // console.log('Verificando el valor de id:', req.params.id);
    const id = req.params.id;
    // res.json({ "message": " waiting try " });
    //  console.log("este es el resultado :",req.body);
     const { title , description, price , images } = req.body;
     const result = await db.execute(`UPDATE contacts SET title = '${title}', description = '${description}', price = '${price}' , images = '${images}' WHERE id = ${id};`);
     if (result.rowsAffected > 0) {
        res.json({ "message": "User updated" });
     } else { 
        res.status(404).json({ "message": "User not updated" });
     } 
});
app.delete('/products/:id', async (req, res) => {
    const id = req.params.id;
    const value = await db.execute(`DELETE FROM contacts WHERE id = ${id};`);
    res.json({ "message": "User deleted", value });
});
// app.delete('/products/:id', async (req, res) => {
//     const id = req.params.id;
//     const value = await db.execute(`DELETE FROM contacts WHERE id = ${id};`);
//     res.json({ "message": "User deleted", "value": value.changes.toString() }); // Convertir BigInt a String
// });

app.listen(app.get('port'), () => {
    console.log(`Server listening on port ${app.get('port')}`);
});
