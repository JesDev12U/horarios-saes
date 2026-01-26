export default class EdificiosSalones {
  constructor() {
    this.verificarCantidadMaterias();
    this.cargarInputs();
    this.handlerButtonGuardarES();
  }

  // Si da de baja, o se termina el semestre, se debe limpiar el localStorage
  verificarCantidadMaterias() {
    // Buscar la tabla de horario de manera robusta
    let tablaHorario = document.querySelector(
      "#ctl00_mainCopy_GV_Horario tbody",
    );

    if (!tablaHorario) {
      const elementoConId = document.querySelector('[id*="GV_Horario"]');
      if (elementoConId) {
        let elementoActual = elementoConId;
        while (elementoActual && elementoActual.tagName !== "TABLE") {
          elementoActual = elementoActual.parentElement;
        }
        if (elementoActual && elementoActual.tagName === "TABLE") {
          tablaHorario = elementoActual.querySelector("tbody");
        }
      }
    }

    if (!tablaHorario) {
      console.error(
        "[Horarios SAES] EdificiosSalones: No se encontro el tbody de la tabla",
      );
      return;
    }

    // Contar cuantas materias tiene
    const cantidadMaterias = tablaHorario.querySelectorAll("tr").length - 1; // -1 para no contar el encabezado
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
      "export-buttons BotonGuinda chicomediano redondeado",
    );
    button.textContent = "Guardar edificios y salones";
    td.appendChild(button);
    tr.appendChild(td);
    divBotones.appendChild(tr);

    // Buscar la tabla de horario de manera robusta
    let $tabla = document.getElementById("ctl00_mainCopy_GV_Horario");

    if (!$tabla) {
      $tabla = document.querySelector('table[id="ctl00_mainCopy_GV_Horario"]');
    }

    if (!$tabla) {
      const elementoConId = document.querySelector('[id*="GV_Horario"]');
      if (elementoConId) {
        let elementoActual = elementoConId;
        while (elementoActual && elementoActual.tagName !== "TABLE") {
          elementoActual = elementoActual.parentElement;
        }
        if (elementoActual && elementoActual.tagName === "TABLE") {
          $tabla = elementoActual;
        }
      }
    }

    if (!$tabla) {
      console.error(
        "[Horarios SAES] EdificiosSalones: No se pudo encontrar la tabla de horario",
      );
      return;
    }

    const $trs = $tabla.querySelectorAll("tbody tr");

    $trs.forEach((tr, index) => {
      if (index === 0) return;
      let numCtrl = index + 1 > 9 ? `${index + 1}` : `0${index + 1}`;

      // Buscar dinámicamente los labels de los días de la semana
      const diasBuscados = [
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
      ];

      diasBuscados.forEach((dia, diaIndex) => {
        const labelSelector = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_${dia}`;
        const contenido = tr.querySelector(labelSelector);

        // Si no existe el label, continuar con el siguiente día
        if (!contenido) return;
        if (contenido.textContent === "") return;

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
        inputEdificio.setAttribute(
          "id",
          `ctl${numCtrl}_dia${diaIndex}_edificio`,
        );
        inputEdificio.setAttribute("class", "input-edificios");
        inputEdificio.setAttribute("type", "text");
        inputEdificio.setAttribute(
          "value",
          `${
            localStorage.getItem(`ctl${numCtrl}_dia${diaIndex}_edificio`)
              ? localStorage.getItem(`ctl${numCtrl}_dia${diaIndex}_edificio`)
              : ""
          }`,
        );
        const labelSalon = document.createElement("label");
        labelSalon.textContent = "Salón";
        const inputSalon = document.createElement("input");
        inputSalon.setAttribute("id", `ctl${numCtrl}_dia${diaIndex}_salon`);
        inputSalon.setAttribute("class", "input-salones");
        inputSalon.setAttribute("type", "text");
        inputSalon.setAttribute(
          "value",
          `${
            localStorage.getItem(`ctl${numCtrl}_dia${diaIndex}_salon`)
              ? localStorage.getItem(`ctl${numCtrl}_dia${diaIndex}_salon`)
              : ""
          }`,
        );
        fragment.appendChild(br);
        fragment.appendChild(labelEdificio);
        fragment.appendChild(inputEdificio);
        fragment.appendChild(labelSalon);
        fragment.appendChild(inputSalon);
        contenido.appendChild(fragment);
      });
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
