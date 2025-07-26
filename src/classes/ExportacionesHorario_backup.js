export default class ExportacionesHorario {
  constructor(horario) {
    this.horario = horario;
    this.cargarLibreriasPDF();
  }

  async cargarLibreriasPDF() {
    // Cargar jsPDF y html2canvas dinámicamente
    if (!window.jsPDF) {
      await this.cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    if (!window.html2canvas) {
      await this.cargarScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }
  }

  cargarScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  pdf() {
    const divBotones = document.querySelector(".container");
    const center = document.createElement("center");
    
    // Contenedor para los botones de exportación
    const exportContainer = document.createElement("div");
    exportContainer.className = "export-container";
    exportContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 20px 0;
      flex-wrap: wrap;
    `;

    // Botón PDF Directo (nuevo)
    const buttonPDFDirecto = document.createElement("button");
    buttonPDFDirecto.setAttribute("id", "btn-pdf-directo");
    buttonPDFDirecto.setAttribute("class", "export-buttons BotonGuinda chicomediano redondeado");
    buttonPDFDirecto.innerHTML = "📄 Descargar PDF";
    buttonPDFDirecto.style.cssText = `
      background: #8B0000;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    `;

    // Botón PDF Navegador (método original)
    const buttonPDFNavegador = document.createElement("button");
    buttonPDFNavegador.setAttribute("id", "btn-pdf-navegador");
    buttonPDFNavegador.setAttribute("class", "export-buttons BotonGuinda chicomediano redondeado");
    buttonPDFNavegador.innerHTML = "🖨️ Imprimir";
    buttonPDFNavegador.style.cssText = `
      background: #A0522D;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    `;

    // Botón Exportar Imagen
    const buttonImagen = document.createElement("button");
    buttonImagen.setAttribute("id", "btn-imagen");
    buttonImagen.setAttribute("class", "export-buttons BotonGuinda chicomediano redondeado");
    buttonImagen.innerHTML = "🖼️ Guardar Imagen";
    buttonImagen.style.cssText = `
      background: #2E8B57;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    `;

    // Agregar efectos hover
    [buttonPDFDirecto, buttonPDFNavegador, buttonImagen].forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.opacity = '0.8';
        btn.style.transform = 'scale(1.05)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
      });
    });

    exportContainer.appendChild(buttonPDFDirecto);
    exportContainer.appendChild(buttonPDFNavegador);
    exportContainer.appendChild(buttonImagen);
    center.appendChild(exportContainer);

    const br = document.createElement("br");
    divBotones.appendChild(center);
    divBotones.appendChild(br);

    // Event Listeners
    this.configurarEventListeners();
  }

  configurarEventListeners() {
    // PDF Directo con jsPDF
    document.getElementById("btn-pdf-directo")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await this.exportarPDFDirecto();
    });

    // PDF con método original (navegador)
    document.getElementById("btn-pdf-navegador")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await this.exportarPDFNavegador();
    });

    // Exportar como imagen
    document.getElementById("btn-imagen")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await this.exportarImagen();
    });
  }

  async exportarPDFDirecto() {
    try {
      // Mostrar indicador de carga
      this.mostrarCargando("Generando PDF...");

      await this.cargarLibreriasPDF();
      
      const tabla = document.getElementById("tabla-horario");
      if (!tabla) {
        throw new Error("No se encontró la tabla del horario");
      }

      // Crear una copia de la tabla para optimizar para PDF
      const tablaOptimizada = await this.optimizarTablaParaPDF(tabla);

      // Generar el canvas con html2canvas
      const canvas = await html2canvas(tablaOptimizada, {
        scale: 2, // Mayor calidad
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: tablaOptimizada.offsetWidth,
        height: tablaOptimizada.offsetHeight
      });

      // Crear PDF con jsPDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calcular dimensiones para que quepa en la página
      const imgWidth = 190; // mm (A4 width - margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Si la imagen es muy alta, ajustar
      const maxHeight = 270; // mm (A4 height - margins)
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      if (imgHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (canvas.width * maxHeight) / canvas.height;
      }

      // Agregar título
      pdf.setFontSize(16);
      pdf.setTextColor(128, 0, 0); // Maroon
      pdf.text('Horario de Clases - SAES IPN', 105, 20, { align: 'center' });
      
      // Agregar fecha
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generado el: ${fecha}`, 105, 28, { align: 'center' });

      // Agregar la imagen
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', (210 - finalWidth) / 2, 35, finalWidth, finalHeight);

      // Generar nombre del archivo
      const nombreArchivo = `horario-saes-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Descargar el PDF
      pdf.save(nombreArchivo);

      // Limpiar
      document.body.removeChild(tablaOptimizada);
      this.ocultarCargando();

      this.mostrarNotificacion("✅ PDF descargado exitosamente", "success");

    } catch (error) {
      console.error("Error al generar PDF:", error);
      this.ocultarCargando();
      this.mostrarNotificacion("❌ Error al generar PDF: " + error.message, "error");
    }
  }
  
  async exportarPDFNavegador() {
    // Método original mantenido para compatibilidad
    let contenido = document.getElementById("tabla-horario").outerHTML;
    try {
      this.mostrarCargando("Preparando para imprimir...");
      
      const url = document.getElementById("script-horarios").dataset.url_horario;
      const urlCSS = document.getElementById("script-horarios").dataset.url_horario_css;
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

      this.ocultarCargando();

      // Esperar a que la ventana cargue antes de imprimir
      setTimeout(() => {
        ventana.print();
        URL.revokeObjectURL(urlBlob);
      }, 1000);
    } catch (err) {
      this.ocultarCargando();
      console.error(err);
      this.mostrarNotificacion("❌ Error al preparar impresión: " + err.message, "error");
    }
  }

  async exportarImagen() {
    try {
      this.mostrarCargando("Generando imagen...");
      
      await this.cargarLibreriasPDF(); // html2canvas está incluido aquí
      
      const tabla = document.getElementById("tabla-horario");
      if (!tabla) {
        throw new Error("No se encontró la tabla del horario");
      }

      // Crear una copia optimizada para imagen
      const tablaOptimizada = await this.optimizarTablaParaPDF(tabla);

      const canvas = await html2canvas(tablaOptimizada, {
        scale: 3, // Mayor calidad para imagen
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `horario-saes-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // Simular clic para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar
      document.body.removeChild(tablaOptimizada);
      this.ocultarCargando();
      
      this.mostrarNotificacion("✅ Imagen descargada exitosamente", "success");

    } catch (error) {
      this.ocultarCargando();
      console.error("Error al generar imagen:", error);
      this.mostrarNotificacion("❌ Error al generar imagen: " + error.message, "error");
    }
  }

  async optimizarTablaParaPDF(tablaOriginal) {
    // Crear una copia de la tabla optimizada para exportación
    const tabla = tablaOriginal.cloneNode(true);
    
    // Aplicar estilos específicos para exportación
    tabla.style.cssText = `
      font-family: Arial, sans-serif;
      border-collapse: collapse;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: white;
      font-size: 12px;
    `;

    // Optimizar celdas
    const celdas = tabla.querySelectorAll('th, td');
    celdas.forEach(celda => {
      celda.style.border = '1px solid #333';
      celda.style.padding = '8px';
      celda.style.textAlign = 'center';
      celda.style.verticalAlign = 'middle';
      celda.style.wordWrap = 'break-word';
      
      // Ajustar colores para mejor contraste en PDF
      if (celda.classList.contains('td-materia') && celda.style.backgroundColor) {
        const color = celda.style.backgroundColor;
        // Mantener el color pero asegurar buen contraste
        celda.style.backgroundColor = color;
        celda.style.color = this.calcularColorTextoContraste(color);
      }
    });

    // Optimizar headers
    const headers = tabla.querySelectorAll('th');
    headers.forEach(header => {
      header.style.backgroundColor = '#800000';
      header.style.color = 'white';
      header.style.fontWeight = 'bold';
      header.style.fontSize = '14px';
    });

    // Agregar al DOM temporalmente para medición
    tabla.style.position = 'absolute';
    tabla.style.left = '-9999px';
    tabla.style.top = '-9999px';
    document.body.appendChild(tabla);

    return tabla;
  }

  calcularColorTextoContraste(backgroundColor) {
    // Convertir color a RGB y calcular luminancia
    const rgb = this.extraerRGB(backgroundColor);
    if (!rgb) return '#000000';
    
    const luminancia = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminancia > 0.5 ? '#000000' : '#ffffff';
  }

  extraerRGB(color) {
    // Manejar diferentes formatos de color
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    } else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      return match ? {
        r: parseInt(match[0]),
        g: parseInt(match[1]),
        b: parseInt(match[2])
      } : null;
    }
    return null;
  }

  mostrarCargando(mensaje) {
    // Crear indicador de carga
    const loader = document.createElement('div');
    loader.id = 'export-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;

    const loaderContent = document.createElement('div');
    loaderContent.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    const spinner = document.createElement('div');
    spinner.style.cssText = `
      border: 4px solid #f3f3f3;
      border-radius: 50%;
      border-top: 4px solid #800000;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    `;

    const text = document.createElement('p');
    text.textContent = mensaje;
    text.style.cssText = `
      margin: 0;
      color: #333;
      font-weight: bold;
    `;

    // Agregar animación CSS si no existe
    if (!document.getElementById('spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    loaderContent.appendChild(spinner);
    loaderContent.appendChild(text);
    loader.appendChild(loaderContent);
    document.body.appendChild(loader);
  }

  ocultarCargando() {
    const loader = document.getElementById('export-loader');
    if (loader) {
      document.body.removeChild(loader);
    }
  }

  mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-family: Arial, sans-serif;
      font-weight: bold;
      z-index: 10001;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
      background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#17a2b8'};
    `;

    notificacion.textContent = mensaje;

    // Agregar animación si no existe
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notificacion);

    // Auto-remover después de 4 segundos
    setTimeout(() => {
      notificacion.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(notificacion)) {
          document.body.removeChild(notificacion);
        }
      }, 300);
    }, 4000);
  }
}
