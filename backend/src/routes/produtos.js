const express= require("express");
const router= express.Router();
const db= require("../db");

router.get("/", async(req, res, next)=>{
    try{
        const produtos= await db.findAlProdutos();
        res.json(produtos);
    } catch (error){
        next(error);
    }
});

router.get("/:id", async(req, res, next)=>{
    try{
        const id= parseInt(req.params.id);
        const produto= await db.findProdutoById(id);

        if (!produto){
            return res.status(404).json({message: "Produto não encontrado!"});
        }
        res.json(produto);
    }catch(error){
        next(error);
    }
});

router.post("/", async (req, res, next)=>{
    try{
        const novoProduto= req.body;

        if(!novoProduto.nome || !novoProduto.preco){
            return res.status(400).json({message: "Nome e Preço não obrigatorios."});
        }
        const result= await db.insertProduto(novoProduto);
        res.status(201).json({id: result.id, ...novoProduto});
    }catch(error){
        next(error);
    }
});

router.put ("/:id", async (req, res, next)=>{
    try{
        const id= parseInt(req.params.id);
        const produtoAtualizado= req.body;

        const rowsAffected= await db.updateProduto(id, produtoAtualizado);

        if (rowsAffected===0){
            return res.status(404).json({message: "Produto não encontardo para atualização."});
        }
        res.json({message: "Produto atualizado com sucesso!"});
    }catch (error){
        next(error);
    }
});

router.delete("/:id", async (req, res, next)=>{
    try{
        const id= parseInt(req.params.id);
        const rowsAffected= await db.deleteProduto(id);

        if(rowsAffected===0){
            return res.status(404).json({message: "Peroduto não encontrado para exclusão"});
        }
        res.status(204).send();
    }catch(error){
        next(error);
    }
});
module.exports= router;