var socket;
var tamanhoFonte = 10;
var corFonte = 'black';
var funcao = 0;
var usuario;

function setup(){

    var canvas = createCanvas(500,400)
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    canvas.position(x, y);
    background('white');
    borda(500,400);
    /*
    var x1 = windowWidth * 0.40;
    var y1 = windowHeight * 0.60;
    var canvas = createCanvas(x1,y1);
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) / 2;
    canvas.position(x, y);
    background('white');
    borda(x1,y1);
    */ 

    socket = io.connect('http://localhost:4000');
    socket.on('mouse', newDrawing);
}

function borda(x,y){
    stroke('blue');
    line(0, 0, x, 0);
    line(0, 0, 0, y);
    line(0, y, x, y);
    line(x, 0, x, y);
}

 function newDrawing(data){
    stroke(data.cor);
    strokeWeight(data.tam);
    line(data.x, data.y, data.px, data.py);
    if(data.func === 1){
        background('white');
        strokeWeight(1);
        borda(500,400);
    }
}

function mouseDragged(){
    var data = {
        x: mouseX,
        y: mouseY,
        px: pmouseX,
        py: pmouseY,
        tam: tamanhoFonte,
        cor: corFonte,
        func: 0
    }

    if(usuario != ""){
        socket.emit('mouse', data)
        stroke(corFonte);
        strokeWeight(tamanhoFonte);
        line(mouseX, mouseY, pmouseX, pmouseY);
    }
    
}

//Funçoes de Botoes
function aumentarFonte(){
    tamanhoFonte += 2;
}

function diminuirFonte(){
    if(tamanhoFonte >= 4)
        tamanhoFonte -= 2;
}

function alterarCorFonte(value){
    corFonte = '#' + value;
}

function novo(){
    if(usuario != ""){
        atual = tamanhoFonte;
        background('white');
        strokeWeight(1);
        borda(600,500);
        strokeWeight(tamanhoFonte);

        var data = {
            x: mouseX,
            y: mouseY,
            px: pmouseX,
            py: pmouseY,
            tam: tamanhoFonte,
            cor: corFonte,
            func: 1
        }
        socket.emit('mouse', data);
    }   
}

var flag = 0;
var xmlhttp3 = new XMLHttpRequest();
xmlhttp3.onreadystatechange = function() {
    if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200){
        usuario = xmlhttp3.responseText;
        if(usuario != "" && flag == 1){
            alert("Desenhe a palavra: " + usuario);
        }
        if(usuario == ""){
            flag = 0;
        }
        flag++;
    }
  }
  
  function update3() {
    xmlhttp3.open("GET","/getTurno0", true);
    xmlhttp3.send();
  }

  setInterval(update3,1500);

 /* function mudaTurno(){
    xmlhttp3.open("GET","/mudaTurno", true);
    xmlhttp3.send();
  }*/
  
  //setInterval(mudaTurno, 15000);