const express =require("express");
const router =express.Router();
const produtosRouter = require("./produtos");
const pedidosRouter = require("./pedidos"); 

router.get("/",(req,res) => {
    res.json({
        message: "Bem-Vindo a API",
        status: "online",
        version: "1.0.0",
    });
});

router.use("/produtos", produtosRouter);
router.use("/pedidos", pedidosRouter);

module.exports=router;