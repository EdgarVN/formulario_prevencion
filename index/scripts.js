// Esperar a que el DOM esté completamente cargado antes de ejecutar cualquier código
document.addEventListener('DOMContentLoaded', function () {

  const loginForm = document.getElementById('loginForm');
  const formContainer = document.getElementById('formContainer');
  const webSimForm = document.getElementById('webSimForm');
  const fileInputs = document.querySelectorAll('input[type="file"]');

  // Evento para manejar el inicio de sesión
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();  // Prevenir el comportamiento predeterminado del formulario

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validación simple del usuario
    if ((email === 'edgar.visurraga@sacmigroup.com' && password === '1234') ||
      (email === 'veronica.centelles@sacmigroup.com' && password === '1234')) {
      loginForm.classList.add('hidden');  // Esconder el formulario de inicio de sesión
      formContainer.classList.remove('hidden');  // Mostrar el formulario principal
       // Solicitar el valor de la constante lugar
      const lugar = prompt("Por favor, ingrese el valor para 'lugar':");
      const fechaHoraActual = new Date();
      const fechaHoraFormato = `${fechaHoraActual.getFullYear()}${(fechaHoraActual.getMonth() + 1).toString().padStart(2, '0')}${fechaHoraActual.getDate().toString().padStart(2, '0')}${fechaHoraActual.getHours().toString().padStart(2, '0')}${fechaHoraActual.getMinutes().toString().padStart(2, '0')}${fechaHoraActual.getSeconds().toString().padStart(2, '0')}`;
      const variableAutomatica = lugar + fechaHoraFormato;
    } }else {
      alert('Usuario o contraseña incorrecto');  // Mostrar un mensaje de error
    }
  });

  // Limitar la cantidad de archivos que se pueden subir (máximo 5)
  fileInputs.forEach(input => {
    input.addEventListener('change', function () {
      if (this.files.length > 5) {
        alert('Por favor, seleccione un máximo de 5 archivos.');
        this.value = '';  // Resetear el campo de selección de archivos
      }
    });
  });

  // Evento para manejar la generación del PDF y la subida a GitHub
  webSimForm.addEventListener('submit', async function (e) {
    e.preventDefault();  // Prevenir el envío del formulario

    if (confirm('¿Está seguro de que desea enviar el formulario?')) {
      alert('Formulario enviado con éxito. Se descargará una copia en PDF.');

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait'
      });

      const margin = 42.52;  // Margen de 1.5 cm
      const bottomMargin = 56.7; // 2 cm de margen inferior (56.7 puntos)
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yOffset = margin + 100;  // Comenzamos dejando espacio para la cabecera (100pt)

      // Función para agregar el encabezado
      const addHeader = () => {
        doc.setFontSize(16);
        doc.text('ACTA DE CONFORMIDAD', pageWidth / 2, margin, { align: 'center' });
        doc.setFontSize(12);
        doc.text(new Date().toLocaleDateString(), pageWidth - margin, margin, { align: 'right' });
        // Aquí puedes añadir una imagen o más detalles si lo necesitas
      };

      // Función para agregar el contenido con saltos de línea
      const addContent = (title, content) => {
        yOffset += 30;  // Espacio entre secciones
        doc.setFontSize(14);
        doc.text(title, margin, yOffset);
        yOffset += 20;

        // Separar el contenido por saltos de línea (\n)
        const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
        doc.setFontSize(12);
        lines.forEach(line => {
          doc.text(line, margin, yOffset);
          yOffset += 15;  // Incrementar espacio entre líneas

          // Verificar si el contenido se acerca al margen inferior
          checkPageOverflow(doc);
        });
      };

      // Función para cargar imágenes y añadirlas al PDF alineadas en una fila
      const addImage = async (fileInput, doc) => {
        if (fileInput.files.length > 0) {
          let imgXOffset = margin;  // Inicio de la posición X para las imágenes
          let imgYOffset = yOffset;  // YOffset actual para las imágenes
          const imgWidth = 100;  // Ancho de cada imagen en puntos
          const imgHeight = 100;  // Alto de cada imagen en puntos
          const imgMargin = 28.35;  // Margen de 1 cm entre las imágenes

          for (let file of fileInput.files) {
            if (file.type.startsWith('image/')) {
              const imgData = await loadImage(file); // Cargar la imagen

              // Verificar si el espacio vertical restante es suficiente para la imagen
              checkPageOverflow(doc);

              // Añadir la imagen al PDF en la posición actual
              doc.addImage(imgData, 'JPEG', imgXOffset, imgYOffset, imgWidth, imgHeight);
              imgXOffset += imgWidth + imgMargin;  // Mover la posición X para la siguiente imagen

              // Si la siguiente imagen desborda el ancho de la página, mover a la siguiente fila
              if (imgXOffset + imgWidth + margin > pageWidth) {
                imgXOffset = margin;  // Reiniciar la posición X
                imgYOffset += imgHeight + imgMargin;  // Mover hacia abajo para la siguiente fila
              }

              // Si la imagen desborda el final de la página, agregar una nueva página
              if (imgYOffset + imgHeight + margin > pageHeight - bottomMargin) {
                doc.addPage();
                addHeader();
                imgXOffset = margin;  // Reiniciar X en la nueva página
                imgYOffset = margin + 100;  // Reiniciar Y en la nueva página con espacio para la cabecera
              }
            }
          }
          yOffset = imgYOffset + imgHeight + 10;  // Ajustar yOffset final después de las imágenes
        }
      };

      // Función para cargar la imagen del archivo
      const loadImage = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            const img = new Image();
            img.onload = () => resolve(event.target.result); // Devolver la imagen en base64
            img.src = event.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file); // Leer el archivo como base64
        });
      };

      // Función para verificar si el contenido se está acercando al margen inferior
      const checkPageOverflow = (doc) => {
        if (yOffset > pageHeight - bottomMargin) {
          doc.addPage();
          addHeader();
          yOffset = margin + 100;  // Reiniciar el yOffset con espacio para la cabecera
        }
      };

      // Agregar el encabezado
      addHeader();

      // Recorrer los títulos, descripciones y archivos del formulario
      for (let i = 1; i <= 4; i++) {
        const titulo = document.getElementById(`titulo${i}`);
        const descripcion = document.getElementById(`descripcion${i}`);
        const subirArchivos = document.getElementById(`subir${i}`);

        // Verificar que los elementos existan antes de acceder a sus valores
        if (titulo && descripcion) {
          addContent(`Título ${i}:`, titulo.value);
          addContent(`Descripción ${i}:`, descripcion.value);

          // Añadir imágenes (si las hay)
          if (subirArchivos) {
            await addImage(subirArchivos, doc);
          }
        } else {
          console.warn(`Elemento no encontrado: Título ${i} o Descripción ${i}`);
        }
      }

      // Guardar el PDF en la máquina local
      try {
        doc.save('acta_reunion.pdf');  // Nombre del archivo que se descargará en el sistema del usuario
      } catch (err) {
        console.error('Error al guardar el PDF:', err);
      }

      // Subir el PDF a GitHub
      await uploadPDFToGitHub(doc);
    }
  });

  // Función para subir el PDF al repositorio de GitHub
  async function uploadPDFToGitHub(doc) {
    const token = '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';  // Reemplazar por tu token personal de GitHub
    const repo = 'formulario_prevencion';
    const owner = 'EdgarVN';
    const path = 'Acta/acta_reunion.pdf';

    // Convertir el PDF a base64
    const pdfContent = doc.output('datauristring');
    const base64Content = pdfContent.split(',')[1];  // Extraer la parte base64

    // Preparar la solicitud para la API de GitHub
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Subida de PDF de acta de reunión',
        content: base64Content
      })
    });

    // Verificar si la subida fue exitosa
    if (response.ok) {
      alert('El PDF se ha subido a GitHub correctamente.');
    } else {
      alert('Hubo un error al subir el PDF a GitHub.');
      console.error(await response.text());
    }
  }
});
