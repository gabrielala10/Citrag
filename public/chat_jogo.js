var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
    document.getElementById("chat").value = xmlhttp.responseText;
}

function update() {
  xmlhttp.open("GET","/gettext", true);
  xmlhttp.send();
}

function send() {
  var msg = document.getElementById('msg').value;

  xmlhttp.open("GET","/sendtext?usuario=" + usuario + "&msg=" + msg, true);
  xmlhttp.send();
}

setInterval(update, 1000);