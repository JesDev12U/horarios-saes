export default class Horario {
  constructor() {
    this.horario = this.obtenerHorario();
    this.dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    this.intervalo = this.detectarMediasHoras() ? 0.5 : 1;
    this.intervalos = this.generarIntervalos();
  }

  formatTime(time) {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  }

  detectarMediasHoras() {
    return this.horario.some((materia) =>
      materia
        .slice(1)
        .some(
          (horas) =>
            horas[0] && (horas[0][0] % 1 !== 0 || horas[0][1] % 1 !== 0)
        )
    );
  }

  generarIntervalos() {
    const intervalos = new Set();
    this.horario.forEach((materia) => {
      for (let i = 1; i < materia.length; i++) {
        if (materia[i][0]) {
          const [inicio, fin] = materia[i][0];
          for (let hora = inicio; hora <= fin; hora += this.intervalo) {
            intervalos.add(hora);
          }
        }
      }
    });
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
      "N505", // Nombre de la materia
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
    const $tabla = document.getElementById("ctl00_mainCopy_GV_Horario");
    const $trs = $tabla.querySelectorAll("tbody tr");
    const horario = [];
    $trs.forEach((tr, index) => {
      if (index === 0) return;
      let numCtrl = index + 1 > 9 ? `${index + 1}` : `0${index + 1}`;
      const nombreMateria = `<p>${
        tr.querySelector(`#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Grupo`)
          .textContent
      }</p><p><b>${tr
        .querySelector(`#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Materia`)
        .textContent.slice(7)}</b></p><p class="p-profesor"><i>${
        tr.querySelector(
          `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Profesores`
        ).textContent
      }</i></p>
      `;
      const lunes = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Lunes`;
      const martes = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Martes`;
      const miercoles = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Miercoles`;
      const jueves = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Jueves`;
      const viernes = `#ctl00_mainCopy_GV_Horario_ctl${numCtrl}_Lbl_Viernes`;
      const edificioLunes = localStorage.getItem(`ctl${numCtrl}_dia0_edificio`);
      const salonLunes = localStorage.getItem(`ctl${numCtrl}_dia0_salon`);
      const edificioMartes = localStorage.getItem(
        `ctl${numCtrl}_dia1_edificio`
      );
      const salonMartes = localStorage.getItem(`ctl${numCtrl}_dia1_salon`);
      const edificioMiercoles = localStorage.getItem(
        `ctl${numCtrl}_dia2_edificio`
      );
      const salonMiercoles = localStorage.getItem(`ctl${numCtrl}_dia2_salon`);
      const edificioJueves = localStorage.getItem(
        `ctl${numCtrl}_dia3_edificio`
      );
      const salonJueves = localStorage.getItem(`ctl${numCtrl}_dia3_salon`);
      const edificioViernes = localStorage.getItem(
        `ctl${numCtrl}_dia4_edificio`
      );
      const salonViernes = localStorage.getItem(`ctl${numCtrl}_dia4_salon`);
      const edificioSalonLunes = [edificioLunes, salonLunes];
      const edificioSalonMartes = [edificioMartes, salonMartes];
      const edificioSalonMiercoles = [edificioMiercoles, salonMiercoles];
      const edificioSalonJueves = [edificioJueves, salonJueves];
      const edificioSalonViernes = [edificioViernes, salonViernes];
      const horas = [
        nombreMateria,
        [
          this.convertirHoraATiempo(tr.querySelector(lunes).textContent),
          edificioSalonLunes,
        ],
        [
          this.convertirHoraATiempo(tr.querySelector(martes).textContent),
          edificioSalonMartes,
        ],
        [
          this.convertirHoraATiempo(tr.querySelector(miercoles).textContent),
          edificioSalonMiercoles,
        ],
        [
          this.convertirHoraATiempo(tr.querySelector(jueves).textContent),
          edificioSalonJueves,
        ],
        [
          this.convertirHoraATiempo(tr.querySelector(viernes).textContent),
          edificioSalonViernes,
        ],
      ];
      horario.push(horas);
    });
    return horario;
  }

  generarHTML() {
    const fragment = document.createDocumentFragment();
    const table = document.createElement("table");
    table.setAttribute("id", "tabla-horario");
    table.innerHTML = `
      <thead>
        <tr>
          <th style="padding: 0 30px 0 30px;">Hora</th>
          <th>Lunes</th>
          <th>Martes</th>
          <th>Miércoles</th>
          <th>Jueves</th>
          <th>Viernes</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    const celdasCombinadas = {};

    this.intervalos.forEach((hora, index) => {
      const tr = document.createElement("tr");
      const tdHora = document.createElement("td");
      tdHora.setAttribute("class", "td-hora");
      const horaInicio = hora;
      const horaFin =
        index + 1 < this.intervalos.length
          ? this.intervalos[index + 1]
          : hora + this.intervalo;
      tdHora.innerHTML = `<p>${this.formatTime(horaInicio)} - ${this.formatTime(
        horaFin
      )}</p>`;
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
          const horarioDia = materia[diaIndex + 1][0];
          if (horarioDia && hora >= horarioDia[0] && hora < horarioDia[1]) {
            materiaEncontrada = materia;
          }
        });

        if (materiaEncontrada) {
          const [inicio, fin] = materiaEncontrada[diaIndex + 1][0];
          const duracion = (fin - inicio) / this.intervalo;

          if (hora === inicio) {
            const textEdificioSalon =
              materiaEncontrada[diaIndex + 1][1][0] &&
              materiaEncontrada[diaIndex + 1][1][1]
                ? `<p><b>Edificio: ${
                    materiaEncontrada[diaIndex + 1][1][0]
                  }</b></p>
                <p><b>Salón: ${materiaEncontrada[diaIndex + 1][1][1]}</b></p>`
                : "";
            td.innerHTML = materiaEncontrada[0] + textEdificioSalon;
            td.rowSpan = duracion;
            celdasCombinadas[diaIndex] = duracion - 1;
          }
        } else {
          td.textContent = "";
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    const $horarioTr = table.querySelectorAll("tbody tr");
    $horarioTr.forEach((tr) => {
      const contenidos = [];
      tr.querySelectorAll("td").forEach((td, index) => {
        if (index !== 0) contenidos.push(td.textContent);
      });
      if (contenidos.length === 5 && contenidos.every((value) => value === ""))
        tr.outerHTML = "";
    });
    fragment.appendChild(table);
    return fragment;
  }
}
