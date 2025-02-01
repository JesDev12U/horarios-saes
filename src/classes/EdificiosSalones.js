export default class EdificiosSalones {
  constructor() {
    this.verificarCantidadMaterias();
    this.cargarInputs();
    this.handlerButtonGuardarES();
  }

  // Si da de baja, o se termina el semestre, se debe limpiar el localStorage
  verificarCantidadMaterias() {
    // Contar cuantas materias tiene
    const cantidadMaterias =
      document
        .querySelector("#ctl00_mainCopy_GV_Horario tbody")
        .querySelectorAll("tr").length - 1; // -1 para no contar el encabezado
    if (localStorage.getItem("cantidad_materias")) {
      if (
        Number(localStorage.getItem("cantidad_materias")) !== cantidadMaterias
      )
        localStorage.clear();
    } else {
      localStorage.setItem("cantidad_materias", cantidadMaterias);
    }
  }

  cargarInputs() {
    // Botón para guardar los Edificios y Salones en el localStorage
    const divBotones = document.querySelector(".container table tbody");
    const tr = document.createElement("tr");
    tr.setAttribute("align", "right");
    const td = document.createElement("td");
    const button = document.createElement("button");
    button.setAttribute("id", "btn-guardarES");
    button.setAttribute(
      "class",
      "export-buttons BotonGuinda chicomediano redondeado"
    );
    button.textContent = "Guardar edificios y salones";
    td.appendChild(button);
    tr.appendChild(td);
    divBotones.appendChild(tr);
    const $tabla = document.getElementById("ctl00_mainCopy_GV_Horario");
    const $trs = $tabla.querySelectorAll("tbody tr");
    $trs.forEach((tr, index) => {
      if (index === 0) return;
      let numCtrl = index + 1 > 9 ? `${index + 1}` : `0${index + 1}`;
      const lunes = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Lunes`;
      const martes = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Martes`;
      const miercoles = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Miercoles`;
      const jueves = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Jueves`;
      const viernes = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Viernes`;
      const dias = [lunes, martes, miercoles, jueves, viernes];
      for (let i = 0; i < dias.length; i++) {
        const contenido = tr.querySelector(dias[i]);
        if (contenido.textContent === "") continue;
        // Quitamos el Edificio y Salón que pone el SAES por defecto
        contenido.textContent = contenido.textContent
          .split("")
          .splice(0, 13)
          .join("");

        const fragment = document.createDocumentFragment();
        const br = document.createElement("br");
        const labelEdificio = document.createElement("label");
        labelEdificio.textContent = "Edificio";
        const inputEdificio = document.createElement("input");
        inputEdificio.setAttribute("id", `ctl${numCtrl}_dia${i}_edificio`);
        inputEdificio.setAttribute("class", "input-edificios");
        inputEdificio.setAttribute("type", "text");
        inputEdificio.setAttribute(
          "value",
          `${
            localStorage.getItem(`ctl${numCtrl}_dia${i}_edificio`)
              ? localStorage.getItem(`ctl${numCtrl}_dia${i}_edificio`)
              : ""
          }`
        );
        const labelSalon = document.createElement("label");
        labelSalon.textContent = "Salon";
        const inputSalon = document.createElement("input");
        inputSalon.setAttribute("id", `ctl${numCtrl}_dia${i}_salon`);
        inputSalon.setAttribute("class", "input-salones");
        inputSalon.setAttribute("type", "text");
        inputSalon.setAttribute(
          "value",
          `${
            localStorage.getItem(`ctl${numCtrl}_dia${i}_salon`)
              ? localStorage.getItem(`ctl${numCtrl}_dia${i}_salon`)
              : ""
          }`
        );
        fragment.appendChild(br);
        fragment.appendChild(labelEdificio);
        fragment.appendChild(inputEdificio);
        fragment.appendChild(labelSalon);
        fragment.appendChild(inputSalon);
        contenido.appendChild(fragment);
      }
    });
  }

  handlerButtonGuardarES() {
    document.getElementById("btn-guardarES").addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".input-edificios").forEach((input) => {
        if (
          input.value === "" &&
          localStorage.getItem(input.getAttribute("id")) === null
        )
          return;
        localStorage.setItem(input.getAttribute("id"), input.value);
      });
      document.querySelectorAll(".input-salones").forEach((input) => {
        if (
          input.value === "" &&
          localStorage.getItem(input.getAttribute("id")) === null
        )
          return;
        localStorage.setItem(input.getAttribute("id"), input.value);
      });
      window.location.reload();
    });
  }
}
