const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3000;
const porta = process.env.GG || 4000;
var server = app.listen(porta);
var socket = require('socket.io');
var io = socket(server);
app.listen(PORT);
var palavra;

let MongoClient = require('mongodb').MongoClient, format = require;
let url = "mongodb+srv://dunnes:mongo1234@cluster0-viyz5.mongodb.net/test?retryWrites=true&w=majority";
let MONGO_CONFIG = {useUnifiedTopology: true,
useNewUrlParser: true}

var bodyParser = require('body-parser')
app.use( bodyParser.json() );      // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));   // to support URL-encoded bodies
app.use(express.json());       // to support JSON-encoded bodies
app.use(session({
	secret: "chave criptográfica",
	secure: false,
	resave: false,
	saveUninitialized: false,
}));

io.sockets.on('connection', novaConexao);

function novaConexao(socket){
    socket.on('mouse', mouseMsg);
    
    function mouseMsg(data){
        socket.broadcast.emit('mouse',data);
    }
}

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    if(req.session.usuario){
        res.sendFile(__dirname + '/public/logado.html');
    }else{
        res.sendFile(__dirname + '/public/menu.html');
    }
    
});

app.get('/sairdojogo', function (req, res) {
    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        res.sendFile(__dirname + '/public/logado.html');
        var usuario = req.session.usuario;
        var dbo = db.db("Citrag");

        dbo.collection("sala").deleteOne({Nome: usuario},function(err) {
            if (err) throw err;
            db.close();
        });
    });
});

app.get('/jogar', function (req, res) {
    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        res.sendFile(__dirname + '/public/jogo.html');
        var usuario = req.session.usuario;
        var dbo = db.db("Citrag");
        dbo.collection("sala").count().then((count)=>{

            dbo.collection("sala").insertOne({Nome: usuario, Turno: count},function(err) {
                if (err) throw err;
                db.close();
            });
        });
    });
});

app.get('/cadastrar', function (req, res) {
    res.sendFile(__dirname + '/public/cadastrar.html');
});

app.get('/logar', function (req, res) {
    res.sendFile(__dirname + '/public/logar.html');
});

app.post('/login', function (req, res) {
    var usuario = req.body.usuario;
    var senha = req.body.senha;
    
    if(usuario === undefined || usuario == '' || senha === undefined || senha == ''){
        res.sendFile(__dirname + '/public/logar.html');
    }else{
        MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
            if (err) throw err;
                var dbo = db.db("Citrag");
                dbo.collection("usuarios").findOne({Nome:usuario, Senha:senha}).then((result) => {
                    if (result) {
                        req.session.usuario = usuario;
                        res.sendFile(__dirname + '/public/logado.html');
                        db.close();
                    } else {
                        dbo.collection("usuarios").insertOne({Nome:usuario, Senha: senha},function(err, result) {
                            if (err) throw err;
                            res.sendFile(__dirname + '/public/logar.html');
                            db.close();
                    });
                }
            });
        });
    } 
});

app.post('/cadastrando', function (req, res) {
    var usuario = req.body.usuario;
    var senha = req.body.senha;
    
    if(usuario === undefined || usuario == '' || senha === undefined || senha == ''){
        res.sendFile(__dirname + '/public/cadastrar.html');
    }else{
        MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
            if (err) throw err;
                var dbo = db.db("Citrag");
                dbo.collection("usuarios").findOne({Nome:usuario}).then((result) => {
                    if (result) {
                        res.sendFile(__dirname + '/public/cadastrar.html');
                        db.close();
                    } else {
                        dbo.collection("usuarios").insertOne({Nome:usuario, Senha: senha},function(err, result) {
                            if (err) throw err;
                            res.sendFile(__dirname + '/public/menu.html');
                            db.close();
                    });
                }
            });
        });
    }
});

app.get('/sair', function (req,res){
    req.session.destroy(function() {
        res.sendFile(__dirname + '/public/menu.html');
    });
});

var texto = "";
var placar = ""
app.get('/sendtext', function(req, res) {
	var usuario = req.session.usuario;
    var msg = req.query.msg;

    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        var dbo = db.db("Citrag");

        dbo.collection("sala").findOne({Turno:0}).then((result) => {

            if(msg == palavra){
                if(usuario == result.Nome)
                    res.send(texto);
                else{
                    dbo.collection("sala").updateOne({Turno:0 },{$set: {Turno: 1}}, function(err) {
                        if (err) throw err;
                        db.close();
                    });

                    dbo.collection("sala").updateOne({Nome:usuario },{$set: {Turno: 0}}, function(err) {
                        if (err) throw err;
                        db.close();
                    });
                    
                texto +=  usuario +" acertou o desenho!" + "\n";
                palavra = undefined;
                }
            }
            else{
                texto += usuario + ": " + msg + "\n";
            }

        });
    });
        
    res.send(texto);
});

app.get('/gettext', function (req, res) {
	res.send(texto);
});


app.get('/getplacar', function(req, res) {
    var aux;
    var placar = "";
    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        var dbo = db.db("Citrag");
         dbo.collection("sala").find({}, { projection: { _id: 0, Nome: 1, Turno:1 }}).toArray(function(err, result) {
            if (err) throw err;
            var tamanho = result.length;
            for(let i = 0; tamanho > i ; i++){
                aux =  "Nome: " + result[i].Nome + " Turno: " + result[i].Turno + "\n";
                placar = placar + aux;
            }
            res.send(placar);
            db.close();
        })
    });
});

function selecionarPalavra(){
    var id_palavra = Math.floor(Math.random() * (60 - 1)) + 1;
    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        var dbo = db.db("Citrag");
        dbo.collection("palavras").findOne({_id:id_palavra}).then((result) => {
            if (result) {
                db.close();
                palavra = result.Nome;       
            }
        });
    });
}

app.get('/getTurno0', function(req, res) {
    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
            var dbo = db.db("Citrag");
            
        dbo.collection("sala").findOne({Nome:(req.session.usuario)}).then((result) => {
            if (result) {
                if(result.Turno == 0){
                    if(palavra == undefined)
                        selecionarPalavra();
                    res.send(palavra);
                }else{
                    res.send("");
                }
            }
            db.close();
        });
    });
});


/*
app.get('/mudaTurno', function(req, res) {
    console.log("Passei Aqui")

    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        var usuario = req.session.usuario;
        var dbo = db.db("Citrag");
        dbo.collection("sala").count().then((count)=>{
            dbo.collection("sala").updateOne({Turno: 0},{$set: {Turno: count}}, function(err) {
                if (err) throw err;
                db.close();
            });
            
            for(let i = 0; count > i; i++){
                console.log("Contador I :" + i);
                dbo.collection("sala").updateOne({Turno: (i+1)},{$set: {Turno: i}}, function(err) {
                    if (err) throw err;
                    db.close();
                });
            }

            dbo.collection("sala").updateOne({Turno: count},{$set: {Turno: count-1}}, function(err) {
                if (err) throw err;
                db.close();
            });
        });
    });
});*/

/*
function mudaTurno(){
 
    console.log("Passei Aqui")

    MongoClient.connect(url, MONGO_CONFIG,function(err, db) {
        if (err) throw err;
        var dbo = db.db("Citrag");
        dbo.collection("sala").count().then((count)=>{
            console.log("Turno 0 para final")
            dbo.collection("sala").updateOne({Turno: 0},{$set: {Turno: count}}, function(err) {
                if (err) throw err;
                db.close();
            });
            console.log("Turno 0 para final: Pronto")
            console.log("Decrementa todos")
            for(let i = 0; count > i; i++){
                dbo.collection("sala").updateOne({Turno: (i+1)},{$set: {Turno: i}}, function(err) {
                    if (err) throw err;
                    db.close();
                });
            }
            console.log("Decrementa todos: Pronto")
            /*
            dbo.collection("sala").updateOne({Turno: count},{$set: {Turno: count-1}}, function(err) {
                if (err) throw err;
                db.close();
            });
            
        });
    });
}

setInterval(mudaTurno, 40000)
*/