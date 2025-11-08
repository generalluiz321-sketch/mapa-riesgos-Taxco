import {
  guardarMarcadorFirestore,
  cargarMarcadoresFirestore,
  borrarMarcadorFirestore,
  auth,
  iniciarSesion
} from './firebase.js';

let usuarioAutenticado = null;

document.getElementById("login-btn").addEventListener("click", async () => {
  const user = await iniciarSesion();
  if (user?.uid === "89DYIFl4vfZQzHLqDm0qw1TwK0y1") {
    usuarioAutenticado = user;
    alert("Modo edición activado");
  } else {
    alert("No tienes permisos para editar");
  }
});


// Inicializar mapa
const map = L.map('map').setView([18.555, -99.605], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
map.doubleClickZoom.disable();

// Íconos personalizados
const iconos = {
  rojo: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  azul: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  verde: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  amarillo: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })
};

let marcadores = [];

// Guardar marcador en Firestore
async function guardarMarcador(lat, lng, nota, color, enlace) {
  const nuevo = { lat, lng, nota, color, enlace };
  await guardarMarcadorFirestore(nuevo);
}

// Eliminar marcador del mapa y Firestore
async function eliminarMarcador(marker, datos) {
  map.removeLayer(marker);
  marcadores = marcadores.filter((m) => {
    const pos = m.getLatLng();
    return !(pos.lat === datos.lat && pos.lng === datos.lng);
  });
  await borrarMarcadorFirestore(datos);
}

// Crear marcador visual
function crearMarcador(datos) {
  const icono = iconos[datos.color] || iconos.rojo;
  const marker = L.marker([datos.lat, datos.lng], { icon: icono }).addTo(map);

  let contenido = `<b>${datos.nota}</b><br><div class="boton-grupo">`;

  if (datos.enlace) {
    contenido += `
      <a href="${datos.enlace}" target="_blank">
        <button class="btn-enlace"><i class="fas fa-link"></i> Enlace</button>
      </a>`;
  }

  if (usuarioAutenticado?.uid === "89DYIFl4vfZQzHLqDm0qw1TwK0y1") {
    contenido += `
      <button class="btn-editar" onclick="editarMarcador(${datos.lat}, ${datos.lng}, \`${datos.nota}\`, \`${datos.color}\`, \`${datos.enlace || ''}\`)">
        <i class="fas fa-edit"></i> Editar
      </button>
      <button class="btn-borrar" onclick="borrarMarcador(${datos.lat}, ${datos.lng}, \`${datos.nota}\`)">
        <i class="fas fa-trash"></i> Borrar
      </button>
    `;
  }

  contenido += `</div>`;
  marker.bindPopup(L.popup().setContent(contenido));
  marcadores.push(marker);
}


// Editar marcador
window.editarMarcador = async function(lat, lng, nota, color, enlace) {
  if (!usuarioAutenticado) return;

  const nuevaNota = prompt("Nueva descripción:", nota);
  if (!nuevaNota) return;

  const nuevoColor = prompt("Nuevo color (rojo, azul, verde, amarillo):", color).toLowerCase();
  const nuevoEnlace = prompt("Nuevo enlace (opcional):", enlace);

  const datosOriginales = { lat, lng, nota };
  const marker = marcadores.find((m) => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });

  if (marker) {
    await eliminarMarcador(marker, datosOriginales);
  }

  const nuevosDatos = { lat, lng, nota: nuevaNota, color: nuevoColor, enlace: nuevoEnlace };
  await guardarMarcador(nuevosDatos.lat, nuevosDatos.lng, nuevosDatos.nota, nuevosDatos.color, nuevosDatos.enlace);
  crearMarcador(nuevosDatos);
};

// Borrar marcador desde botón
window.borrarMarcador = async function(lat, lng, nota) {
  if (!usuarioAutenticado) return;

  const datos = { lat, lng, nota };
  const marker = marcadores.find((m) => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });
  if (marker) {
    await borrarMarcadorFirestore(marker.docId);
  }
};

// Cargar marcadores al iniciar
const marker = L.marker([datos.lat, datos.lng], { icon: icono }).addTo(map);
marker.docId = datos.id; // guardar id del documento

// Agregar marcador al hacer doble clic
map.on('dblclick', async function(e) {
  if (!usuarioAutenticado) return;

  const nota = prompt("Describe esta zona:");
  if (!nota) return;

  const color = prompt("Color del marcador (rojo, azul, verde, amarillo):").toLowerCase();
  const enlace = prompt("¿Quieres agregar un enlace? (opcional):");

  const datos = { lat: e.latlng.lat, lng: e.latlng.lng, nota, color, enlace };
  await guardarMarcador(datos.lat, datos.lng, datos.nota, datos.color, datos.enlace);
  crearMarcador(datos);
});
