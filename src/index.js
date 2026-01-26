import Horario from "./classes/Horario.js";
import ExportacionesHorario from "./classes/ExportacionesHorario.js";
import EdificiosSalones from "./classes/EdificiosSalones.js";
import ColorPicker from "./classes/ColorPicker.js";

let extensionInicializada = false;

function inicializarExtension() {
  if (extensionInicializada) return;

  // Buscar específicamente el div contenedor
  const panelDatos = document.getElementById("ctl00_mainCopy_PnlDatos");

  // Intentar múltiples métodos para encontrar la tabla
  let tablaHorario = document.getElementById("ctl00_mainCopy_GV_Horario");

  if (!tablaHorario) {
    tablaHorario = document.querySelector(
      'table[id="ctl00_mainCopy_GV_Horario"]',
    );
  }

  if (!tablaHorario)
    tablaHorario = document.querySelector('table[id*="GV_Horario"]');

  if (!tablaHorario) {
    const cualquierElemento = document.querySelector('[id*="GV_Horario"]');

    if (cualquierElemento) {
      // Intentar encontrar la tabla desde el elemento encontrado
      let elementoActual = cualquierElemento;
      while (elementoActual && elementoActual.tagName !== "TABLE") {
        elementoActual = elementoActual.parentElement;
      }

      if (elementoActual && elementoActual.tagName === "TABLE")
        tablaHorario = elementoActual;
    }
  }

  if (!tablaHorario) return false;

  try {
    // Asignamos las exportaciones
    let exportaciones = new ExportacionesHorario();
    exportaciones.crearBotonesExportacion();

    // Cargamos el horario
    let horario = new Horario();
    // Establecemos la referencia del horario en las exportaciones
    exportaciones.setHorario(horario);

    const $container = document.querySelector(".container");
    $container.setAttribute("style", ""); // Quita el height innecesario del SAES

    const horarioHTML = horario.generarHTML();
    $container.appendChild(horarioHTML);
    // Cargamos el color picker después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      try {
        const colorPicker = new ColorPicker(horario);
        horario.setColorPicker(colorPicker);

        // Agregar el color picker antes de la tabla
        const tablaHorario = document.getElementById("tabla-horario");
        if (tablaHorario && tablaHorario.parentNode) {
          tablaHorario.parentNode.insertBefore(
            colorPicker.generarHTML(),
            tablaHorario,
          );
        }
      } catch (error) {
        console.error(
          "[Horarios SAES] Error al inicializar el color picker:",
          error,
        );
      }
    }, 100);

    // Cargamos los inputs de edificios y salones
    new EdificiosSalones();

    extensionInicializada = true;
    return true;
  } catch (error) {
    console.error("[Horarios SAES] Error fatal al cargar la extension:", error);
    console.error("[Horarios SAES] Stack trace:", error.stack);
    return false;
  }
}

// Observador para detectar cuando aparece la tabla en el DOM
function observarDOM() {
  const observer = new MutationObserver((mutations) => {
    if (extensionInicializada) {
      observer.disconnect();
      return;
    }

    // Buscar la tabla de manera robusta
    let tablaHorario = document.getElementById("ctl00_mainCopy_GV_Horario");

    if (!tablaHorario) {
      const elementoConId = document.querySelector('[id*="GV_Horario"]');
      if (elementoConId) {
        let elementoActual = elementoConId;
        while (elementoActual && elementoActual.tagName !== "TABLE") {
          elementoActual = elementoActual.parentElement;
        }
        if (elementoActual && elementoActual.tagName === "TABLE") {
          tablaHorario = elementoActual;
        }
      }
    }

    if (tablaHorario && inicializarExtension()) observer.disconnect();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Intentar inicializar inmediatamente
if (!inicializarExtension()) {
  // Si falla, esperar a DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (!inicializarExtension()) {
        observarDOM();
      }
    });
  } else {
    // Si el DOM ya está listo, activar el observador
    observarDOM();
  }

  // También intentar en el evento load
  window.addEventListener("load", () => {
    if (!extensionInicializada) {
      if (!inicializarExtension()) {
        observarDOM();
      }
    }
  });
}
