export default class Horario {
  constructor() {
    this.horario = this.obtenerHorario();
    this.dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    this.intervalo = this.detectarMediasHoras() ? 0.5 : 1;
    this.intervalos = this.generarIntervalos();
    this.colorPicker = null; // Se inicializará después
  }

  formatTime(time) {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }

  detectarMediasHoras() {
    return this.horario.some((materia) =>
      materia
        .slice(1)
        .some(
          (horas) =>
            horas &&
            horas[0] &&
            (horas[0][0] % 1 !== 0 || horas[0][1] % 1 !== 0),
        ),
    );
  }

  generarIntervalos() {
    const intervalos = new Set();
    let horaMinima = null;
    let horaMaxima = null;

    // Encontrar el rango completo de horas (desde la primera clase hasta la última)
    this.horario.forEach((materia) => {
      for (let i = 1; i < materia.length; i++) {
        if (materia[i] && materia[i][0]) {
          const [inicio, fin] = materia[i][0];
          if (horaMinima === null || inicio < horaMinima) {
            horaMinima = inicio;
          }
          if (horaMaxima === null || fin > horaMaxima) {
            horaMaxima = fin;
          }
        }
      }
    });

    // Generar todos los intervalos desde la hora mínima hasta la máxima
    if (horaMinima !== null && horaMaxima !== null) {
      for (let hora = horaMinima; hora < horaMaxima; hora += this.intervalo) {
        intervalos.add(hora);
      }
    }

    return Array.from(intervalos).sort((a, b) => a - b);
  }

  convertirHoraATiempo(horaTexto) {
    if (!horaTexto) return null;
    horaTexto = horaTexto.split("").splice(0, 13).join("").split(" - ");

    let [inicio, fin] = horaTexto;
    inicio = inicio.split(":");
    fin = fin.split(":");

    let horario = [
      Number(inicio[0]) + (Number(inicio[1]) === 30 ? 0.5 : 0),
      Number(fin[0]) + (Number(fin[1]) === 30 ? 0.5 : 0),
    ];

    return horario;
  }

  // Estructura de ejemplo
  /* const horario = [
    [
      DocumentFragment, // Datos de la materia como DocumentFragment
      null, // Lunes
      [ // Martes
        [20, 22], // Hora de la clase [horaInicio, horaFin]
        ["Ingeniería", "0"] // Lugar [edificio, salon]
      ], 
      null, // Miércoles
      [ // Jueves
        [20, 22], 
        [null, null]
      ], 
      null // Viernes
    ],
    ...
  ]; */
  obtenerHorario() {
    // Buscar la tabla de horario de manera robusta
    let $tabla = document.getElementById("ctl00_mainCopy_GV_Horario");

    if (!$tabla)
      $tabla = document.querySelector('table[id="ctl00_mainCopy_GV_Horario"]');

    if (!$tabla) {
      // Buscar cualquier elemento con GV_Horario y navegar hacia la tabla
      const elementoConId = document.querySelector('[id*="GV_Horario"]');
      if (elementoConId) {
        let elementoActual = elementoConId;
        while (elementoActual && elementoActual.tagName !== "TABLE")
          elementoActual = elementoActual.parentElement;

        if (elementoActual && elementoActual.tagName === "TABLE")
          $tabla = elementoActual;
      }
    }

    if (!$tabla) {
      console.error("[Horarios SAES] No se pudo encontrar la tabla de horario");
      return [];
    }

    const $trs = $tabla.querySelectorAll("tbody tr");
    const horario = [];

    $trs.forEach((tr, index) => {
      if (index === 0) return;
      let numCtrl = index + 1 > 9 ? `${index + 1}` : `0${index + 1}`;

      // Crear el fragmento de materia
      const materiaFragment = document.createDocumentFragment();
      const pGrupo = document.createElement("p");
      pGrupo.textContent = tr.querySelector(
        `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Grupo`,
      ).textContent;
      const pMateria = document.createElement("p");
      const bMateria = document.createElement("b");
      bMateria.textContent = tr
        .querySelector(`#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Materia`)
        .textContent.slice(7);
      pMateria.appendChild(bMateria);
      const pProfesor = document.createElement("p");
      pProfesor.setAttribute("class", "p-profesor");
      const iProfesor = document.createElement("i");
      iProfesor.textContent = tr.querySelector(
        `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Profesores`,
      ).textContent;
      pProfesor.appendChild(iProfesor);
      materiaFragment.appendChild(pGrupo);
      materiaFragment.appendChild(pMateria);
      materiaFragment.appendChild(pProfesor);

      // Buscar dinámicamente los labels de los días de la semana
      const diasBuscados = [
        "Lunes",
        "Martes",
        "Miercoles",
        "Jueves",
        "Viernes",
      ];
      const diasEncontrados = [];

      diasBuscados.forEach((dia, diaIndex) => {
        // Intentar encontrar el label específico del día
        const labelSelector = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_${dia}`;
        const labelElement = tr.querySelector(labelSelector);

        if (labelElement) {
          const horaConvertida = this.convertirHoraATiempo(
            labelElement.textContent,
          );

          // Obtener datos del localStorage
          const edificio = localStorage.getItem(
            `ctl${numCtrl}_dia${diaIndex}_edificio`,
          );
          const salon = localStorage.getItem(
            `ctl${numCtrl}_dia${diaIndex}_salon`,
          );
          const edificioSalon = [edificio, salon];

          // Si no hay hora para ese día, agregar null
          if (!horaConvertida) {
            diasEncontrados.push(null);
          } else {
            diasEncontrados.push([horaConvertida, edificioSalon]);
          }
        } else {
          // Si no se encuentra el label, agregar null
          diasEncontrados.push(null);
        }
      });

      const horas = [materiaFragment, ...diasEncontrados];
      horario.push(horas);
    });
    return horario;
  }

  generarHTML() {
    const fragment = document.createDocumentFragment();
    const table = document.createElement("table");
    table.setAttribute("id", "tabla-horario");
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    const thHora = document.createElement("th");
    thHora.setAttribute("style", "padding: 0 30px 0 30px;");
    thHora.textContent = "Hora";
    const thLunes = document.createElement("th");
    thLunes.textContent = "Lunes";
    const thMartes = document.createElement("th");
    thMartes.textContent = "Martes";
    const thMiercoles = document.createElement("th");
    thMiercoles.textContent = "Miércoles";
    const thJueves = document.createElement("th");
    thJueves.textContent = "Jueves";
    const thViernes = document.createElement("th");
    thViernes.textContent = "Viernes";
    const tbodyTable = document.createElement("tbody");
    tr.appendChild(thHora);
    tr.appendChild(thLunes);
    tr.appendChild(thMartes);
    tr.appendChild(thMiercoles);
    tr.appendChild(thJueves);
    tr.appendChild(thViernes);
    thead.appendChild(tr);
    table.appendChild(thead);
    table.appendChild(tbodyTable);
    // table.innerHTML = `
    //   <thead>
    //     <tr>
    //       <th style="padding: 0 30px 0 30px;">Hora</th>
    //       <th>Lunes</th>
    //       <th>Martes</th>
    //       <th>Miércoles</th>
    //       <th>Jueves</th>
    //       <th>Viernes</th>
    //     </tr>
    //   </thead>
    //   <tbody></tbody>
    // `;
    const tbody = table.querySelector("tbody");
    const celdasCombinadas = {};

    this.intervalos.forEach((hora, index) => {
      const tr = document.createElement("tr");
      const tdHora = document.createElement("td");
      tdHora.setAttribute("class", "td-hora");
      const horaInicio = hora;
      const horaFin = hora + this.intervalo;
      const pHora = document.createElement("p");
      pHora.textContent = `${this.formatTime(horaInicio)} - ${this.formatTime(
        horaFin,
      )}`;
      tdHora.appendChild(pHora);
      tr.appendChild(tdHora);

      this.dias.forEach((_dia, diaIndex) => {
        if (celdasCombinadas[diaIndex] && celdasCombinadas[diaIndex] > 0) {
          celdasCombinadas[diaIndex]--;
          return;
        }

        const td = document.createElement("td");
        td.setAttribute("class", "td-materia");
        let materiaEncontrada = null;

        this.horario.forEach((materia) => {
          // Verificar que el día tenga datos y que tenga horario
          const diaData = materia[diaIndex + 1];
          if (!diaData || !diaData[0]) return;

          const horarioDia = diaData[0];
          if (horarioDia && hora >= horarioDia[0] && hora < horarioDia[1]) {
            materiaEncontrada = materia;
          }
        });

        if (materiaEncontrada) {
          const diaData = materiaEncontrada[diaIndex + 1];
          const [inicio, fin] = diaData[0];
          const duracion = (fin - inicio) / this.intervalo;

          if (hora === inicio) {
            const pEdificio = document.createElement("p");
            const bEdificio = document.createElement("b");
            const pSalon = document.createElement("p");
            const bSalon = document.createElement("b");
            if (diaData[1][0] && diaData[1][1]) {
              bEdificio.textContent = `Edificio: ${diaData[1][0]}`;
              bSalon.textContent = `Salón: ${diaData[1][1]}`;
            }
            pEdificio.appendChild(bEdificio);
            pSalon.appendChild(bSalon);
            const clone = materiaEncontrada[0].cloneNode(true);
            clone.appendChild(pEdificio);
            clone.appendChild(pSalon);
            td.appendChild(clone);
            td.rowSpan = duracion;
            celdasCombinadas[diaIndex] = duracion - 1;

            // Aplicar color personalizado
            this.aplicarColorPersonalizado(td, clone);
          }
        } else {
          td.textContent = "";
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    fragment.appendChild(table);
    return fragment;
  }

  aplicarColorPersonalizado(td, materiaClone) {
    const materiaElement = materiaClone.querySelector("b");
    const grupoElement = materiaClone.querySelector("p:first-child");

    if (materiaElement && grupoElement) {
      const nombreMateria = materiaElement.textContent.trim();
      const grupo = grupoElement.textContent.trim();
      const materiaKey = `${nombreMateria}_${grupo}`;

      // Obtener color guardado o usar color por defecto
      const colorGuardado = localStorage.getItem(`color_${materiaKey}`);
      if (colorGuardado) {
        td.style.backgroundColor = colorGuardado;

        // Calcular color de texto basado en el brillo del fondo
        const rgb = this.hexToRgb(colorGuardado);
        if (rgb) {
          const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
          td.style.color = brightness > 128 ? "#000000" : "#ffffff";
        }
      }
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  setColorPicker(colorPicker) {
    this.colorPicker = colorPicker;
  }
}
