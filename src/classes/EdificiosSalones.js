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
    const button = `
      <tr align="right">  
        <td>
          <button id="btn-guardarES" class="export-buttons BotonGuinda chicomediano redondeado">Guadar edificios y salones</button>
        </td>
      </tr>
    `;
    divBotones.innerHTML += button;
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
        contenido.innerHTML = contenido.innerHTML
          .split("")
          .splice(0, 13)
          .join("");
        contenido.innerHTML += `
          <br />
          <label>Edificio</label>
          <input id="ctl${numCtrl}_dia${i}_edificio" class="input-edificios" type="text" value="${
          localStorage.getItem(`ctl${numCtrl}_dia${i}_edificio`)
            ? localStorage.getItem(`ctl${numCtrl}_dia${i}_edificio`)
            : ""
        }" />
          <label>Salón</label>
          <input id="ctl${numCtrl}_dia${i}_salon" class="input-salones" type="text" value="${
          localStorage.getItem(`ctl${numCtrl}_dia${i}_salon`)
            ? localStorage.getItem(`ctl${numCtrl}_dia${i}_salon`)
            : ""
        }" />
        `;
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
