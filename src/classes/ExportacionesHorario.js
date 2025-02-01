export default class ExportacionesHorario {
  pdf() {
    const divBotones = document.querySelector(".container");
    const center = document.createElement("center");
    const button = document.createElement("button");
    button.setAttribute("id", "btn-pdf");
    button.setAttribute(
      "class",
      "export-buttons BotonGuinda chicomediano redondeado"
    );
    button.textContent = "Generar PDF";
    center.appendChild(button);
    const br = document.createElement("br");

    divBotones.appendChild(center);
    divBotones.appendChild(br);

    //Listener para el botón del PDF
    document
      .getElementById("btn-pdf")
      .addEventListener("click", async function (e) {
        e.preventDefault();
        let contenido = document.getElementById("tabla-horario").outerHTML;
        try {
          const url =
            document.getElementById("script-horarios").dataset.url_horario;
          const urlCSS =
            document.getElementById("script-horarios").dataset.url_horario_css;
          const response = await fetch(url);
          const responseCSS = await fetch(urlCSS);
          let html = await response.text();
          let css = await responseCSS.text();
          html = html
            .replace("{{contenido}}", contenido)
            .replace("{{css}}", `<style>${css}</style>`);

          // Convertir el HTML a Blob y abrir en una nueva ventana
          const blob = new Blob([html], { type: "text/html" });
          const urlBlob = URL.createObjectURL(blob);
          const ventana = window.open(urlBlob, "_blank");

          // Esperar a que la ventana cargue antes de imprimir
          setTimeout(() => {
            ventana.print();
            URL.revokeObjectURL(urlBlob);
          }, 1000);
        } catch (err) {
          console.error(err);
        }
      });
  }
}
