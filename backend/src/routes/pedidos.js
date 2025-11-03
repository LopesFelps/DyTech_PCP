const express = require("express");
const router = express.Router();
const db = require("../db");
router.get("/", async (req, res, next) => {
    try {
        const pedidos = await db.findAlPedidos();
        res.json(pedidos);
    } catch (error) {
        next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const pedido = await db.findPedidoById(id);

        if (!pedido) {
            return res.status(404).json({ message: "Pedido não encontrado!" });
        }
        res.json(pedido);
    } catch (error) {
        next(error);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const { itens } = req.body;

        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ message: "O pedido deve conter uma lista de itens." });
        }
        const isValid = itens.every(item => item.produto_id && item.quantidade > 0 && typeof item.quantidade === 'number');
        if (!isValid) {
            return res.status(400).json({ message: "Cada item deve ter um 'produto_id' e 'quantidade' válida (> 0)." });
        }

        const novoPedido = await db.insertPedido(itens);
        res.status(201).json(novoPedido);
    } catch (error) {
        if (error.message.includes("Estoque insuficiente") || error.message.includes("não encontrado")) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const rowsAffected = await db.deletePedido(id); 

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Pedido não encontrado para exclusão" });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

module.exports = router;