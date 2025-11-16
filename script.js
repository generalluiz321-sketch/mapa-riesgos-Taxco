// 🌍 Inicializar mapa con varias capas base
const map = L.map('map').setView([18.555, -99.605], 14);

// Definir capas base
const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

const cycle = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap, CyclOSM'
});

const humanitarian = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap, Humanitarian'
});

const transport = L.tileLayer('https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap, Transport Map'
});

// Añadir capa estándar por defecto
standard.addTo(map);

// Crear objeto con las capas base
const baseMaps = {
  "Estándar": standard,
  "CycleOSM": cycle,
  "Humanitarian": humanitarian,
  "Transporte": transport
};

// Añadir control de capas al mapa (solo estilos)
L.control.layers(baseMaps).addTo(map);

// Desactivar zoom con doble clic
map.doubleClickZoom.disable();

// 🎨 Grupo de marcadores (para poder activarlos/desactivarlos)
const grupoMarcadores = L.layerGroup().addTo(map);

// 📍 Crear marcador visual (modificado para añadir al grupo)
function crearMarcador(datos) {
  const icono = iconos[datos.color] || iconos.rojo;
  const marker = L.marker([datos.lat, datos.lng], { icon: icono });
  marker.docId = datos.id;
  marker.datos = datos;

  marker.bindPopup(L.popup().setContent(generarPopup(datos)));
  grupoMarcadores.addLayer(marker); // 👉 ahora se añaden al grupo
  marcadores.push(marker);
}

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

// 🔘 Botón para activar/desactivar marcadores
const toggleBtn = document.createElement("button");
toggleBtn.innerText = "🗺️ Mostrar/Ocultar marcadores";
toggleBtn.style.position = "absolute";
toggleBtn.style.top = "10px";
toggleBtn.style.left = "10px";
toggleBtn.style.zIndex = "1000";
toggleBtn.style.padding = "8px";
toggleBtn.style.backgroundColor = "#fff";
toggleBtn.style.border = "1px solid #444";
toggleBtn.style.cursor = "pointer";

document.body.appendChild(toggleBtn);

let marcadoresVisibles = true;
toggleBtn.addEventListener("click", () => {
  if (marcadoresVisibles) {
    map.removeLayer(grupoMarcadores);
    toggleBtn.innerText = "🗺️ Mostrar marcadores";
  } else {
    map.addLayer(grupoMarcadores);
    toggleBtn.innerText = "🗺️ Ocultar marcadores";
  }
  marcadoresVisibles = !marcadoresVisibles;
});




