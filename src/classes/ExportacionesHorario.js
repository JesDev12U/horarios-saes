export default class ExportacionesHorario {
  pdf() {
    const divBotones = document.querySelector(".container");
    const buttonPDF = `
      <center>  
        <button id="btn-pdf" class="export-buttons BotonGuinda chicomediano redondeado">Generar PDF</button>
      </center>
      <br />
    `;
    divBotones.innerHTML += buttonPDF;

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
          let ventana = window.open("", "", "width=800,height=600");
          ventana.document.write(html);
          ventana.document.close();
          ventana.focus();
          ventana.print();
          ventana.close();
        } catch (err) {
          console.error(err);
        }
      });
  }
}
