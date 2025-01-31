if (typeof browser === "undefined") var browser = chrome;

const script = document.createElement("script");
script.src = browser.runtime.getURL("src/index.js");
script.setAttribute("id", "script-horarios");
script.setAttribute(
  "data-url_horario",
  browser.runtime.getURL("src/horario.html")
);
script.setAttribute(
  "data-url_horario_css",
  browser.runtime.getURL("src/css/styles.css")
);
script.type = "module";
document.head.appendChild(script);
