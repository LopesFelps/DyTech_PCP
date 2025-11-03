require("dotenv").config();
const express =require("express")
const db = require("./db");
const routes=require("./routes")

const app=express();

app.use(express.json());

app.use("/",routes);

const PORT=process.env.PORT || 3000;

app.listen(PORT,() => {
    console.log("servidor ligado")
})


db.connect();