export default class ColorPicker {
  constructor(horario) {
    this.horario = horario;
    this.coloresPorDefecto = [
      '#E5A6B1', '#A8D5BA', '#FFD93D', '#FFB6C1', 
      '#87CEEB', '#DDA0DD', '#F0E68C', '#FFA07A',
      '#98FB98', '#F5DEB3', '#FFE4B5', '#E0E0E0'
    ];
    this.materias = this.extraerMaterias();
    this.escapeHandler = null; // Para manejar el evento de escape
    this.modalAbierto = false; // Flag para controlar el estado del modal
    
    // Solo inicializar si hay materias válidas
    if (this.materias.length > 0) {
      this.init();
    } else {
      console.warn('No se encontraron materias válidas para el color picker');
    }
  }

  extraerMaterias() {
    const materiasUnicas = new Map();
    
    // Verificar que el horario existe y tiene elementos
    if (!this.horario || !this.horario.horario || !Array.isArray(this.horario.horario)) {
      console.warn('Horario no disponible o formato incorrecto');
      return [];
    }
    
    this.horario.horario.forEach((materia, index) => {
      // Verificar que la materia tiene el formato esperado
      if (!materia || !Array.isArray(materia) || materia.length === 0) {
        return;
      }
      
      const materiaFragment = materia[0];
      
      // Verificar que el fragment existe y es un nodo válido
      if (!materiaFragment || typeof materiaFragment.querySelector !== 'function') {
        return;
      }
      
      const materiaElement = materiaFragment.querySelector('b');
      const grupoElement = materiaFragment.querySelector('p:first-child');
      
      if (materiaElement && grupoElement && 
          materiaElement.textContent && grupoElement.textContent) {
        const nombreMateria = materiaElement.textContent.trim();
        const grupo = grupoElement.textContent.trim();
        
        // Verificar que ambos valores no estén vacíos
        if (nombreMateria && grupo) {
          const key = `${nombreMateria}_${grupo}`;
          
          if (!materiasUnicas.has(key)) {
            materiasUnicas.set(key, {
              index: index,
              nombre: nombreMateria,
              grupo: grupo,
              color: this.obtenerColorGuardado(key) || this.coloresPorDefecto[index % this.coloresPorDefecto.length]
            });
          }
        }
      }
    });
    
    return Array.from(materiasUnicas.values());
  }

  obtenerColorGuardado(materiaKey) {
    return localStorage.getItem(`color_${materiaKey}`);
  }

  guardarColor(materiaKey, color) {
    localStorage.setItem(`color_${materiaKey}`, color);
  }

  obtenerColorPorMateria(nombreMateria, grupo) {
    const key = `${nombreMateria}_${grupo}`;
    const materia = this.materias.find(m => `${m.nombre}_${m.grupo}` === key);
    return materia ? materia.color : this.coloresPorDefecto[0];
  }

  generarHTML() {
    // Crear el botón que abre el modal
    const openButton = document.createElement('button');
    openButton.className = 'open-color-picker-btn';
    openButton.textContent = '🎨 Personalizar Colores';
    openButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.modalAbierto) {
        this.abrirModal();
      }
    });

    return openButton;
  }

  generarModal() {
    const modal = document.createElement('div');
    modal.className = 'color-picker-modal';
    modal.id = 'color-picker-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'color-picker-modal-content';

    // Header del modal
    const header = document.createElement('div');
    header.className = 'color-picker-modal-header';

    const title = document.createElement('h3');
    title.className = 'color-picker-modal-title';
    title.textContent = 'Personalizar Colores de Materias';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-modal-btn';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => {
      this.cerrarModal();
    });

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Contenido del color picker
    const container = document.createElement('div');
    container.className = 'color-picker-container';

    // Verificar si hay materias disponibles
    if (!this.materias || this.materias.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'No se encontraron materias para personalizar colores.';
      mensaje.style.textAlign = 'center';
      mensaje.style.color = '#666';
      container.appendChild(mensaje);
    } else {
      this.materias.forEach((materia) => {
        const materiaItem = document.createElement('div');
        materiaItem.className = 'materia-color-item';

        const nombreSpan = document.createElement('span');
        nombreSpan.className = 'materia-name';
        nombreSpan.textContent = `${materia.nombre} - ${materia.grupo}`;

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.className = 'color-input';
        colorInput.value = materia.color;
        
        const materiaKey = `${materia.nombre}_${materia.grupo}`;
        
        colorInput.addEventListener('change', (e) => {
          const nuevoColor = e.target.value;
          materia.color = nuevoColor;
          this.guardarColor(materiaKey, nuevoColor);
          this.aplicarColoresATabla();
        });

        materiaItem.appendChild(nombreSpan);
        materiaItem.appendChild(colorInput);
        container.appendChild(materiaItem);
      });

      // Botón para resetear colores
      const resetBtn = document.createElement('button');
      resetBtn.className = 'reset-colors-btn';
      resetBtn.textContent = 'Restaurar Colores por Defecto';
      resetBtn.addEventListener('click', () => {
        this.resetearColores();
      });
      container.appendChild(resetBtn);
    }

    modalContent.appendChild(header);
    modalContent.appendChild(container);
    modal.appendChild(modalContent);

    // Cerrar modal al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        e.preventDefault();
        e.stopPropagation();
        this.cerrarModal();
      }
    });

    // Crear handler para la tecla Escape
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        const modalElement = document.getElementById('color-picker-modal');
        if (modalElement && modalElement.classList.contains('show') && this.modalAbierto) {
          this.cerrarModal();
        }
      }
    };

    return modal;
  }

  abrirModal() {
    // Evitar abrir múltiples modales
    if (this.modalAbierto) {
      return;
    }

    // Remover modal existente si existe
    const existingModal = document.getElementById('color-picker-modal');
    if (existingModal) {
      existingModal.remove();
      // Remover event listener anterior si existe
      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
      }
    }

    // Crear y mostrar el nuevo modal
    const modal = this.generarModal();
    document.body.appendChild(modal);
    this.modalAbierto = true;
    
    // Pequeño delay para la animación y para evitar que se cierre inmediatamente
    setTimeout(() => {
      modal.classList.add('show');
      
      // Agregar el evento de escape después de un delay adicional
      setTimeout(() => {
        if (this.modalAbierto) {
          document.addEventListener('keydown', this.escapeHandler);
        }
      }, 200);
    }, 10);
  }

  cerrarModal() {
    const modal = document.getElementById('color-picker-modal');
    if (modal && modal.classList.contains('show') && this.modalAbierto) {
      this.modalAbierto = false;
      modal.classList.remove('show');
      
      // Remover el evento de escape
      if (this.escapeHandler) {
        document.removeEventListener('keydown', this.escapeHandler);
      }
      
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300); // Tiempo de la animación
    }
  }

  aplicarColoresATabla() {
    const tabla = document.getElementById('tabla-horario');
    if (!tabla) return;

    const celdas = tabla.querySelectorAll('.td-materia:not(:empty)');
    
    celdas.forEach((celda) => {
      const materiaElement = celda.querySelector('b');
      const grupoElement = celda.querySelector('p:first-child');
      
      if (materiaElement && grupoElement) {
        const nombreMateria = materiaElement.textContent.trim();
        const grupo = grupoElement.textContent.trim();
        const color = this.obtenerColorPorMateria(nombreMateria, grupo);
        
        celda.style.backgroundColor = color;
        
        // Calcular color de texto basado en el brillo del fondo
        const rgb = this.hexToRgb(color);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        celda.style.color = brightness > 128 ? '#000000' : '#ffffff';
      }
    });
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  resetearColores() {
    this.materias.forEach((materia, index) => {
      const materiaKey = `${materia.nombre}_${materia.grupo}`;
      const colorPorDefecto = this.coloresPorDefecto[index % this.coloresPorDefecto.length];
      
      materia.color = colorPorDefecto;
      localStorage.removeItem(`color_${materiaKey}`);
    });
    
    this.aplicarColoresATabla();
    
    // Actualizar los inputs de color en el modal actual
    const modal = document.getElementById('color-picker-modal');
    if (modal) {
      const colorInputs = modal.querySelectorAll('.color-input');
      colorInputs.forEach((input, index) => {
        if (this.materias[index]) {
          input.value = this.materias[index].color;
        }
      });
    }
  }

  init() {
    // Se aplicarán los colores después de que se genere la tabla
    setTimeout(() => {
      this.aplicarColoresATabla();
    }, 100);
  }
}
