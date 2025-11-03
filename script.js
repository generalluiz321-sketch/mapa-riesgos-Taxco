const map = L.map('map').setView([18.555, -99.605], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
map.doubleClickZoom.disable(); // Si quieres evitar que el mapa haga zoom al hacer doble clic
async function cargarMarcadoresDesdeFirebase() {
  const querySnapshot = await getDocs(collection(db, "marcadores"));
  querySnapshot.forEach((doc) => {
    const datos = doc.data();
    datos.id = doc.id; // Guarda el ID para editar/borrar
    crearMarcador(datos);
  });
}



let marcadores = []; // Lista de marcadores en el mapa
const iconos = {
  rojo: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  azul: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  verde: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  amarillo: L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })

};

async function guardarMarcador(lat, lng, nota, color, enlace) {
  const nuevo = { lat, lng, nota, color, enlace };
  const docRef = await addDoc(collection(db, "marcadores"), nuevo);
  nuevo.id = docRef.id; // Guarda el ID para futuras ediciones
  crearMarcador(nuevo);
}


async function borrarMarcador(id, lat, lng, nota) {
  await deleteDoc(doc(db, "marcadores", id));

  const item = marcadores.find((m) => m.datos.id === id);
  if (item) {
    map.removeLayer(item.marker);
    marcadores = marcadores.filter((m) => m.datos.id !== id);
  }
}


function crearMarcador(datos) {
  const icono = iconos[datos.color] || iconos.rojo;

  const marker = L.marker([datos.lat, datos.lng], { icon: icono }).addTo(map);

  let contenido = `<b>${datos.nota}</b><br>`;
  contenido += `<div class="boton-grupo">`;

  if (datos.enlace) {
    contenido += `
      <a href="${datos.enlace}" target="_blank">
        <button class="btn-enlace"><i class="fas fa-link"></i> Enlace</button>
      </a>
    `;
  }

  contenido += `
    <button class="btn-editar" onclick="editarMarcador('${datos.id}', ${datos.lat}, ${datos.lng}, \`${datos.nota}\`, \`${datos.color}\`, \`${datos.enlace || ''}\`)">
      <i class="fas fa-edit"></i> Editar
    </button>
    <button class="btn-borrar" onclick="borrarMarcador('${datos.id}', ${datos.lat}, ${datos.lng}, \`${datos.nota}\`)">
      <i class="fas fa-trash"></i> Borrar
    </button>
  </div>`;

  marker.bindPopup(contenido);
  marcadores.push({ marker, datos });
}

// edita marcadores
window.editarMarcador = async function(id, lat, lng, nota, color, enlace) {
  const nuevaNota = prompt("Nueva descripción:", nota);
  if (!nuevaNota) return;

  const nuevoColor = prompt("Nuevo color (rojo, azul, verde, amarillo):", color).toLowerCase();
  const nuevoEnlace = prompt("Nuevo enlace (opcional):", enlace);

  const nuevosDatos = { lat, lng, nota: nuevaNota, color: nuevoColor, enlace: nuevoEnlace };

  await updateDoc(doc(db, "marcadores", id), nuevosDatos);

  // Eliminar marcador anterior del mapa
  const item = marcadores.find((m) => m.datos.id === id);
  if (item) {
    map.removeLayer(item.marker);
    marcadores = marcadores.filter((m) => m.datos.id !== id);
  }

  // Crear marcador actualizado
  nuevosDatos.id = id;
  crearMarcador(nuevosDatos);
};

  // Crear el nuevo marcador actualizado
import { getFirestore, collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";


async function editarMarcador(id, lat, lng, nota, color, enlace) {
  const nuevaNota = prompt("Nueva descripción:", nota);
  if (!nuevaNota) return;

  const nuevoColor = prompt("Nuevo color (rojo, azul, verde, amarillo):", color).toLowerCase();
  const nuevoEnlace = prompt("Nuevo enlace (opcional):", enlace);

  const nuevosDatos = { lat, lng, nota: nuevaNota, color: nuevoColor, enlace: nuevoEnlace };

  await updateDoc(doc(db, "marcadores", id), nuevosDatos);

  // Eliminar marcador anterior del mapa
  const item = marcadores.find((m) => m.datos.id === id);
  if (item) {
    map.removeLayer(item.marker);
    marcadores = marcadores.filter((m) => m.datos.id !== id);
  }

  // Crear marcador actualizado
  nuevosDatos.id = id;
  crearMarcador(nuevosDatos);
}

// Cargar marcadores guardados
cargarMarcadoresDesdeFirebase();


// Agregar marcador al hacer clic
map.on('dblclick', async function (e) {
  const nota = prompt("Describe esta zona:");
  if (!nota) return;

  const color = prompt("Color del marcador (rojo, azul, verde, amarillo):").toLowerCase();
  const enlace = prompt("¿Quieres agregar un enlace? (opcional):");

  const datos = { lat: e.latlng.lat, lng: e.latlng.lng, nota, color, enlace };
  await guardarMarcador(datos.lat, datos.lng, datos.nota, datos.color, datos.enlace);
  crearMarcador(datos);
});

// Función global para borrar desde el botón
window.borrarMarcador = function(lat, lng, nota) {
  const datos = { lat, lng, nota };
  const marker = marcadores.find((m) => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });
  if (marker) {
    eliminarMarcador(marker, datos);
  }
};


