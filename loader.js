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
script.setAttribute(
  "data-url_jspdf",
  browser.runtime.getURL("src/lib/jspdf.umd.min.js")
);
script.setAttribute(
  "data-url_html2canvas",
  browser.runtime.getURL("src/lib/html2canvas.min.js")
);
script.type = "module";
document.head.appendChild(script);
