import Horario from "./classes/Horario.js";
import ExportacionesHorario from "./classes/ExportacionesHorario.js";
import EdificiosSalones from "./classes/EdificiosSalones.js";
import ColorPicker from "./classes/ColorPicker.js";

if (document.getElementById("ctl00_mainCopy_GV_Horario")) {
  // Asignamos las exportaciones
  let exportaciones = new ExportacionesHorario();
  exportaciones.crearBotonesExportacion();

  // Cargamos el horario
  let horario = new Horario();
  
  // Establecemos la referencia del horario en las exportaciones
  exportaciones.setHorario(horario);
  
  const $container = document.querySelector(".container");
  $container.setAttribute("style", ""); // Quita el height innecesario del SAES
  $container.appendChild(horario.generarHTML());

  // Cargamos el color picker después de un pequeño delay para asegurar que el DOM esté listo
  setTimeout(() => {
    try {
      const colorPicker = new ColorPicker(horario);
      horario.setColorPicker(colorPicker);
      
      // Agregar el color picker antes de la tabla
      const tablaHorario = document.getElementById("tabla-horario");
      if (tablaHorario && tablaHorario.parentNode) {
        tablaHorario.parentNode.insertBefore(colorPicker.generarHTML(), tablaHorario);
      }
    } catch (error) {
      console.error('Error al inicializar el color picker:', error);
    }
  }, 100);

  // Cargamos los inputs de edificios y salones
  new EdificiosSalones();
}
