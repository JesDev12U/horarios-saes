import Horario from "./classes/Horario.js";
import ExportacionesHorario from "./classes/ExportacionesHorario.js";
import EdificiosSalones from "./classes/EdificiosSalones.js";

if (document.getElementById("ctl00_mainCopy_GV_Horario")) {
  // Asignamos las exportaciones
  let exportaciones = new ExportacionesHorario();
  exportaciones.pdf();

  // Cargamos el horario
  let horario = new Horario();
  const $container = document.querySelector(".container");
  $container.setAttribute("style", ""); // Quita el height innecesario del SAES
  $container.appendChild(horario.generarHTML());

  // Cargamos los inputs de edificios y salones
  new EdificiosSalones();
}
