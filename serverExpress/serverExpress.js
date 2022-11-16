const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send(req.path);
})

let visitas = 1;
app.get("/visitas", (req, res) => {
    res.send("Cantidad de visitas" + visitas);
    visitas++;
})

app.get("/fyh", (req, res) => {
    res.send(JSON.stringify({fye: new Date().toLocaleString()}));
})

const server = app.listen(8081, (req, res) => {
    console.log("Escuchando en 8081");
})