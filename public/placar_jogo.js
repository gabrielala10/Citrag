var xmlhttp2 = new XMLHttpRequest();
xmlhttp2.onreadystatechange = function() {
  if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200)
    document.getElementById("pontos").value = xmlhttp2.responseText;
}

function update2() {
  xmlhttp2.open("GET","/getplacar", true);
  xmlhttp2.send();
}

setInterval(update2, 3000);