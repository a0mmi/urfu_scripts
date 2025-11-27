var fso = new ActiveXObject("Scripting.FileSystemObject");
WScript.Echo("Type file's name: short or long?");
var method = WScript.StdIn.ReadLine();
var inFilename = "";

if (method == "short") {
  inFilename = "short.txt";
} else if (method == "long") {
  inFilename = "long.txt";
} else {
  WScript.Echo("Incorrect name");
  WScript.Quit(1);
}

var open = fso.OpenTextFile(inFilename, 1);
var fileContent = open.ReadAll();
WScript.Echo("Encode worked correctly: " + inFilename);

WScript.Echo("Encoding:");
WScript.echo(fileContent);


function repeat(str, count) {
    str = String(str);
    count = Number(count) || 0;
    if (count <= 0) return "";
    var r = "";
    for (var i = 0; i < count; i++) r += str;
    return r;
}

function jump_encode(str) {
  var length = str.length;
  var res = "";
  var i = 0;

  while (i < length) {
    var runLen = 1;
    while (i + runLen < length && str.charAt(i) === str.charAt(i + runLen) && runLen < 127) {
      runLen++;
    }
    if (runLen > 1) {
      var prefix = 128 + (runLen - 1);           
      res += String.fromCharCode(prefix) + str.charAt(i);
      i += runLen;
      continue;
    }

    var litLen = 1;
    while (i + litLen < length && litLen < 127) {
      if (i + litLen + 1 < length && str.charAt(i + litLen) === str.charAt(i + litLen + 1)) break;
      litLen++;
    }
    var litPrefix = (litLen - 1) & 0x7F;         
    res += String.fromCharCode(litPrefix) + str.substr(i, litLen);
    i += litLen;
  }
  return res;
}

function jump_decode(s) {
  var out = "";
  var i = 0;
  while (i < s.length) {
    var b = s.charCodeAt(i);
    var isRun = (b & 0x80) !== 0;
    var cnt = (b & 0x7F) + 1;
    if (isRun) {
      var ch = s.charAt(i + 1);
      out += repeat(ch, cnt);
      i += 2;
    } else {
      out += s.substr(i + 1, cnt);
      i += 1 + cnt;
    }
  }
  return out;
}

var encoded = jump_encode(fileContent);
WScript.Echo(encoded);

var ts = fso.CreateTextFile("EnJump.txt", true, true);
ts.Write(encoded);
ts.Close();

WScript.Echo("-------------------------------");

var decoded = jump_decode(encoded);
WScript.Echo(decoded);