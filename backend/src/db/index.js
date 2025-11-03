require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DATABASE_URL = process.env.DATABASE_URL;
let db = null; 

function connect(){
    if (db) {
        console.log("Banco de dados já está conectado.");
        return;
    }
    
    if (!DATABASE_URL || !DATABASE_URL.startsWith("sqlite:")) {
        console.log("Nenhuma URL de banco de dados SQLite válida fornecida.");
        return;
    }
    const dbPath = DATABASE_URL.substring("sqlite:".length);
    const absoluteDbPath = path.resolve(dbPath);

    console.log("Tentando conectar ao banco de dados em", absoluteDbPath);
    db = new sqlite3.Database(absoluteDbPath, (err) => {
        if (err) {
            console.error("Erro ao conectar ao banco de dados:", err.message);
            db = null; 
        } else {
            console.log("Conectado ao banco de dados SQLite com sucesso!");
            db.run(`
                CREATE TABLE IF NOT EXISTS produtos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    preco REAL NOT NULL,
                    quantidade INTEGER NOT NULL
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS pedidos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data_pedido TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'PENDENTE',
                    total REAL NOT NULL DEFAULT 0.0
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS itens_pedido (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pedido_id INTEGER NOT NULL,
                    produto_id INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL,
                    preco_unitario REAL NOT NULL,
                    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
                    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT
                )
            `);
        }
    });
}
/**
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array|Object>}
 */
function query(sql, params = []){
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject(new Error("Conexão com o banco de dados não estabelecida."));
        }
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error("Erro ao executar SELECT:", err.message);
                    reject(err);
                } else {
                    console.log("SELECT executado com sucesso.");
                    resolve(rows);
                }
            });
        } else {
            db.run(sql, params, function(err) {
                if (err) {
                    console.error("Erro ao executar comando RUN:", err.message);
                    reject(err);
                } else {
                    console.log("Comando RUN executado com sucesso.");
                    resolve({ 
                        lastID: this.lastID, 
                        changes: this.changes 
                    });
                }
            });
        }
    });
}
async function findAlProdutos(){
    const sql= "SELECT * FROM produtos";
    return query(sql);
}

async function findProdutoById(id){
    const sql= "SELECT * FROM produtos WHERE id= ?";
    const rows= await query(sql, [id]);
    return rows[0];
}

async function insertProduto(produto){
    const sql= "INSERT INTO produtos (nome, preco, quantidade) VALUES (?,?,?)";
    const { nome, preco, quantidade}= produto;
    const result= await query(sql, [nome, preco, quantidade || 0]); 
    return { id: result.lastID, ...produto };
}

async function updateProduto(id, produto){
    const { nome, preco, quantidade }= produto;

    let setClauses = [];
    let params = [];
    
    if (nome !== undefined) {
        setClauses.push("nome = ?");
        params.push(nome);
    }
    if (preco !== undefined) {
        setClauses.push("preco = ?");
        params.push(preco);
    }
    if (quantidade !== undefined) {
        setClauses.push("quantidade = ?");
        params.push(quantidade);
    }

    if (setClauses.length === 0) {
        return 0; 
    }

    const sql = `UPDATE produtos SET ${setClauses.join(", ")} WHERE id = ?`;
    params.push(id);
    
    const result = await query(sql, params);
    return result.changes;
}

async function deleteProduto(id){
    const sql= "DELETE FROM produtos WHERE id = ?";
    const result= await query(sql, [id]);
    return result.changes;
}
async function debitarProduto(id, quantidade){
    const sql = "UPDATE produtos SET quantidade = quantidade - ? WHERE id = ? AND quantidade >= ?";
    const result = await query(sql, [quantidade, id, quantidade]);
    return result.changes;
}

async function creditarProduto(id, quantidade){
    const sql= "UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?";
    const result= await query(sql, [quantidade, id]);
    return result.changes;
}

async function insertPedido(itens){
    const dataPedido = new Date().toISOString();
    let resultPedido = await query(
        "INSERT INTO pedidos (data_pedido, status) VALUES (?, ?)", 
        [dataPedido, 'CONCLUIDO'] 
    );
    const pedidoId = resultPedido.lastID;
    let totalPedido = 0;

    for (const item of itens) {
        const { produto_id, quantidade } = item;
        const produto = await findProdutoById(produto_id);
        
        if (!produto) {
            throw new Error(`Produto com ID ${produto_id} não encontrado.`);
        }
        
        if (produto.quantidade < quantidade) {
            throw new Error(`Estoque insuficiente para o produto ID ${produto_id}. Disponível: ${produto.quantidade}, Solicitado: ${quantidade}`);
        }

        const precoUnitario = produto.preco;
        totalPedido += precoUnitario * quantidade;
        await query(
            "INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
            [pedidoId, produto_id, quantidade, precoUnitario]
        );
        await debitarProduto(produto_id, quantidade);
    }
    await query(
        "UPDATE pedidos SET total = ? WHERE id = ?", 
        [totalPedido, pedidoId]
    );

    return {
        id: pedidoId,
        data_pedido: dataPedido,
        status: 'CONCLUIDO',
        total: totalPedido,
        itens: itens
    };
}
async function findAlPedidos(){
    const sql = "SELECT * FROM pedidos ORDER BY data_pedido DESC";
    return query(sql);
}
async function findPedidoById(id){
    const pedidoSql = "SELECT * FROM pedidos WHERE id = ?";
    const pedido = (await query(pedidoSql, [id]))[0];

    if (!pedido) {
        return undefined;
    }

    const itensSql = "SELECT ip.id, ip.produto_id, ip.quantidade, ip.preco_unitario, p.nome as produto_nome FROM itens_pedido ip JOIN produtos p ON ip.produto_id = p.id WHERE ip.pedido_id = ?";
    const itens = await query(itensSql, [id]);

    return { ...pedido, itens: itens };
}

async function deletePedido(id){
    const pedido = await findPedidoById(id);
    if (!pedido) {
        return 0;
    }
    for (const item of pedido.itens) {
        await creditarProduto(item.produto_id, item.quantidade);
    }
    const sql = "DELETE FROM pedidos WHERE id = ?";
    const result = await query(sql, [id]);
    
    return result.changes;
}
module.exports= { 
    connect, 
    query, 
    findAlProdutos, 
    findProdutoById, 
    insertProduto, 
    updateProduto, 
    deleteProduto, 
    debitarProduto, 
    creditarProduto,
    insertPedido,
    findAlPedidos,
    findPedidoById,
    deletePedido 
};