function removeAccents(strAccents) {
  var strAccents = strAccents.split('');
  var strAccentsOut = new Array();
  var strAccentsLen = strAccents.length;
  var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
  var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
  for (var y = 0; y < strAccentsLen; y++) {
    if (accents.indexOf(strAccents[y]) != -1) {
      strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
    } else
      strAccentsOut[y] = strAccents[y];
  }
  strAccentsOut = strAccentsOut.join('');
  return strAccentsOut;
}

function zap (a) {
  var o = {};
  a.forEach(function abbrfy(i) {
    var words = i.split(" ");
    var abbr = words.shift();

    if (words.length > 0) {
      abbr += words.map(function (word) {
        return word.charAt(0).toUpperCase() + word.substr(1, 2);
      }).join("");
    }

    abbr = removeAccents(abbr);
    o[abbr] = i;
  });
  return JSON.stringify(o);
}