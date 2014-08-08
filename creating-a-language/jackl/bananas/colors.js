var domBuilder = require('dombuilder');

  window.WebFontConfig = {
    google: { families: [ 'Architects+Daughter::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();

var colors = {
  "dark-blue": "#281e8b",
  "light-blue": "#029dba",
  "dark-green": "#16b05b",
  "light-green": "#86cd3e",
  "red": "#f61941",
  "orange": "#f16237",
  "pink": "#ea1b8d",
  "purple": "#4e188f",
  "black": "#403238",
  "brown": "#654c3d",
  "paper": "#fefbe3",
  "ribbon": "#c80b12",
  "line": "#312f2b",
};
var dialog = require('ui/dialog');
var $ = dialog("colors", Object.keys(colors).map(function (name) {
  return ["div", {style: {
    padding: "10px 30px",
    backgroundColor: colors.paper,
    color: colors[name],
    lineHeight: "1em",
    fontFamily: "Architects Daughter",
    fontWeight: "bold",
    // textShadow: "0 0 2px rgba(0,0,0,0.2)",
  }}, name];
}), function () {
  $.close();
});
