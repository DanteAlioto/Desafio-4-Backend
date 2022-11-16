const express = require("express");
const fs = require('fs');

const {
    Router
} = express;

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/public"));

class Contenedor {

    nextId;
    arrayObj = new Array();

    constructor(archivo) {
        this.archivo = archivo;
        if (fs.existsSync(archivo)) {
            this.arrayObj = JSON.parse(fs.readFileSync(this.archivo, "utf-8"));
            this.nextId = this.NextId();
            console.log("existe");
        } else {
            this.nextId = 0;
            fs.writeFileSync(this.archivo, JSON.stringify(this.arrayObj));
            console.log("No existe");
        }
    }

    async save(object) {
        try {
            if (!this.existFile(object)) {
                object["id"] = this.nextId;
                this.nextId++;
                this.arrayObj.push(object);
                await fs.promises.writeFile(this.archivo, JSON.stringify(this.arrayObj));
                console.log("se guardo el objeto con el id: " + object.id);
                return Promise.resolve(object.id);
            } else {
                console.log("El objeto ya existe");
            }
        } catch (err) {
            console.log(err);
        }
    }


    existFile(obj) {
        let response = false;
        this.arrayObj.forEach(element => {
            if (element.title == obj.title && element.price == obj.price && element.thumbnail == obj.thumbnail) {
                response = true;
            }
        });
        return response;
    }

    NextId() {
        if (this.arrayObj.length > 0) {
            let maxId = this.arrayObj.reduce((acc, current) => {
                return Math.max(acc, current.id)
            }, 0)
            return maxId + 1;
        } else {
            return 0;
        }
    }

    async getAll() {
        try {
            const data = await fs.promises.readFile(this.archivo, "utf-8");
            this.arrayObj = JSON.parse(data);
            console.log(this.arrayObj);
        } catch (err) {
            console.log(err);
        }
    }

    async getById(id) {
        let obj = null;
        this.arrayObj.map((element) => {
            if (element.id == id) {
                obj = element;
            }
        })
        console.log(obj);
    }



    async deleteById(id) {
        let flag = false;
        for (let i = 0; i < this.arrayObj.length; i++) {
            if (this.arrayObj[i].id === id) {
                flag = true;
                this.arrayObj.splice(i, 1);
                i--;
            }
        }

        if (flag) {
            try {
                await fs.promises.writeFile(this.archivo, JSON.stringify(this.arrayObj))
                console.log("borro el objeto de id: " + id);
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log("El ID no existe");
        }
    }

    async deleteAll() {
        this.arrayObj = [];
        try {
            await fs.promises.writeFile(this.archivo, JSON.stringify(this.arrayObj))
            console.log("Se borraron todos los objetos de: " + this.archivo);
        } catch (err) {
            console.log(err);
        }
    }
}

const contenedorProductos = new Contenedor("productos.txt");
// ROUTER
const routerProductos = new Router();

routerProductos.get("/productos", async (req, res) => {
    try {
        res.json(await contenedorProductos.getAll());
    } catch (error) {
        console.log(error);
    }
});

routerProductos.get("/productos/:id", (req, res) => {
    try {
        const {
            id
        } = req.params;
        const producto = contenedorProductos.getById(id);
        producto
            ?
            res.json(producto) :
            res.json({
                error: "Producto no encontrado"
            });
    } catch (error) {
        console.log(error);
    }
});

routerProductos.post("/productos", async (req, res) => {
    try {
        const producto = req.body;
        console.log("El producto es" + producto);
        const productoNuevoId = await contenedorProductos.save(producto);
        productoNuevoId
            ?
            res.json({
                ...producto,
                id: productoNuevoId
            }) :
            res.json({
                error: "Producto no encontrado"
            });
    } catch (error) {
        console.log(error);
    }
});

routerProductos.put("/productos/:id", async (req, res) => {
    try {
        const productoActualizar = req.body;
        const {
            id
        } = req.params;
        const productoActualizarId = await contenedorProductos.update(Number(id), productoActualizar);
        productoActualizarId
            ?
            res.json({
                actualizado: "ok",
                id: productoActualizarId
            }) :
            res.json({
                error: "Producto no encontrado"
            });
    } catch (error) {
        console.log(error);
    }
});

routerProductos.delete("/productos/:id", async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const productoId = await contenedorProductos.deleteById(Number(id));
        productoId
            ?
            res.json({
                borrado: "ok",
                id: productoId
            }) :
            res.json({
                error: "Producto no encontrado"
            });
    } catch (error) {
        console.log(error);
    }
});

routerProductos.delete(7)

app.use("/api", routerProductos);
const PORT = 8081;
const server = app.listen(PORT, () => {
    console.log("Escuchando en el puerto " + PORT);
});