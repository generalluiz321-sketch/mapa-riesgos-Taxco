import {
  guardarMarcadorFirestore,
  cargarMarcadoresFirestore,
  borrarMarcadorFirestore,
  auth,
  iniciarSesion
} from './firebase.js';

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let usuarioAutenticado = null;
let marcadores = [];

// 🔄 Detectar cambios de sesión
onAuthStateChanged(auth, user => {
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (user?.uid === "89DYIFl4vfZQzHLqDm0qw1TwK0y1") {
    usuarioAutenticado = user;
    loginBtn.style.backgroundColor = "#4caf50";
    loginBtn.innerText = "✔ Admin4";
    logoutBtn.style.display = "block";
  } else {
    usuarioAutenticado = null;
    loginBtn.style.backgroundColor = "#eee";
    loginBtn.innerText = "🔒";
    logoutBtn.style.display = "none";
  }

  marcadores.forEach(marker => {
    const datos = marker.datos;
    marker.bindPopup(L.popup().setContent(generarPopup(datos)));
  });
});

// 🔒 Botón login
document.getElementById("login-btn").addEventListener("click", async () => {
  const user = await iniciarSesion();
  if (user?.uid === "89DYIFl4vfZQzHLqDm0qw1TwK0y1") {
    usuarioAutenticado = user;
    const btn = document.getElementById("login-btn");
    btn.style.backgroundColor = "#4caf50";
    btn.innerText = "✔ Admin";
    alert("Modo edición activado");
    document.getElementById("logout-btn").style.display = "block";
  } else {
    alert("No tienes permisos para editar");
  }
});

// 🔓 Botón logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Sesión cerrada");
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
});

// 🌍 Inicializar mapa
const map = L.map('map').setView([18.555, -99.605], 14);

// Capas base
const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
});
const cycle = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap, CyclOSM'
});
const humanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap, Humanitarian'
});
const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap, SRTM | Style © OpenTopoMap'
});
const esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
});


// Capas para temas
const osmStandard = standard;
const stadiaDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
  attribution: '© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors'
});
const esriGray = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri, HERE, Garmin, © OpenStreetMap contributors'
});

// Añadir capa estándar por defecto
osmStandard.addTo(map);

// Control de capas
const baseMaps = {
  "Estándar": standard,
  "Relieve 1": cycle,
  "Reliev 2": openTopoMap,
  "Humanitarian": humanitarian,
  "Esri World Imagery": esriWorldImagery

};
const capasControl = L.control.layers(baseMaps).addTo(map);

// Forzar que se abra/cierre solo al presionar
const capasContainer = capasControl.getContainer();
["click", "touchstart"].forEach(evt => {
  capasContainer.addEventListener(evt, function (e) {
    e.stopPropagation();
    capasContainer.classList.toggle("leaflet-control-layers-expanded");
  });
});

map.doubleClickZoom.disable();

// 🎨 Íconos personalizados
const iconos = {
  rojo: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  azul: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  verde: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] }),
  amarillo: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] })
};

// 📌 Guardar marcador
async function guardarMarcador(lat, lng, nota, color, enlace) {
  const nuevo = { lat, lng, nota, color, enlace };
  const id = await guardarMarcadorFirestore(nuevo);
  return { id, ...nuevo };
}

// 🗑️ Eliminar marcador
async function eliminarMarcador(marker) {
  map.removeLayer(marker);
  marcadores = marcadores.filter(m => m !== marker);
  await borrarMarcadorFirestore(marker.docId);
}

// 📍 Popup
function generarPopup(datos) {
  let contenido = `<b>${datos.nota}</b><br><div class="boton-grupo">`;
  if (datos.enlace) {
    contenido += `<a href="${datos.enlace}" target="_blank">
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
      </button>`;
  }
  contenido += `</div>`;
  return contenido;
}

// 📍 Crear marcador visual
function crearMarcador(datos) {
  const icono = iconos[datos.color] || iconos.rojo;
  const marker = L.marker([datos.lat, datos.lng], { icon: icono }).addTo(map);
  marker.docId = datos.id;
  marker.datos = datos;

  marker.bindPopup(L.popup().setContent(generarPopup(datos)));
  marcadores.push(marker);
}

// ✏️ Editar marcador
window.editarMarcador = async function(lat, lng, nota, color, enlace) {
  if (!usuarioAutenticado) return;

  const nuevaNota = prompt("Nueva descripción:", nota);
  if (!nuevaNota) return;

  const nuevoColor = prompt("Nuevo color (rojo, azul, verde, amarillo):", color).toLowerCase();
  const nuevoEnlace = prompt("Nuevo enlace (opcional):", enlace);

  const marker = marcadores.find(m => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });

  if (marker) {
    await eliminarMarcador(marker);
  }

  const nuevosDatos = await guardarMarcador(lat, lng, nuevaNota, nuevoColor, nuevoEnlace);
  crearMarcador(nuevosDatos);
};

// 🗑️ Borrar marcador desde botón
window.borrarMarcador = async function(lat, lng, nota) {
  if (!usuarioAutenticado) return;

  const marker = marcadores.find(m => {
    const pos = m.getLatLng();
    return pos.lat === lat && pos.lng === lng;
  });
  if (marker) {
    await eliminarMarcador(marker);
  }
};

// 📥 Cargar marcadores al iniciar
cargarMarcadoresFirestore((datos) => crearMarcador(datos));

// ➕ Agregar marcador al hacer doble clic
map.on('dblclick', async function(e) {
  if (!usuarioAutenticado) return;

  const nota = prompt("Describe esta zona:");
  if (!nota) return;

  const color = prompt("Color del marcador (rojo, azul, verde, amarillo):").toLowerCase();
  const enlace = prompt("¿Quieres agregar un enlace? (opcional):");

  const datos = await guardarMarcador(e.latlng.lat, e.latlng.lng, nota, color, enlace);
  crearMarcador(datos);
});

// 🎨 Cambiar tema (claro, oscuro, gris)
const themeBtn = document.getElementById("theme-btn");
const themes = ["light-mode", "dark-mode", "gray-mode"];
let currentThemeIndex = 0;

// Inicializar en modo claro
document.body.classList.add(themes[currentThemeIndex]);

themeBtn.addEventListener("click", () => {
  // Quitar tema actual
  document.body.classList.remove(themes[currentThemeIndex]);

  // Cambiar al siguiente
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  document.body.classList.add(themes[currentThemeIndex]);

  // Cambiar texto del botón según el tema
  if (themes[currentThemeIndex] === "light-mode") {
    themeBtn.innerText = "🌞 Claro";
  } else if (themes[currentThemeIndex] === "dark-mode") {
    themeBtn.innerText = "🌙 Oscuro";
  } else {
    themeBtn.innerText = "🌫️ Gris";
  }
});
















