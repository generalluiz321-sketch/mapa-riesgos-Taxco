// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ⚠️ Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBV-8tyGvx7z51EenCnd2QoT9dvuvmch4Q",
  authDomain: "mapa-taxco.firebaseapp.com",
  projectId: "mapa-taxco",
  storageBucket: "mapa-taxco.appspot.com",
  messagingSenderId: "529569034869",
  appId: "1:529569034869:web:d67fe8eac365778600fe3c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Proveedor de Google
const provider = new GoogleAuthProvider();

// 🔑 Función de login con Google
export async function iniciarSesion() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user; // devuelve el usuario autenticado
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
}

// 📌 Guardar marcador en Firestore
export async function guardarMarcadorFirestore(datos) {
  try {
    await addDoc(collection(db, "markers"), datos);
  } catch (error) {
    console.error("Error guardando marcador:", error);
  }
}

// 📌 Cargar marcadores en tiempo real
export function cargarMarcadoresFirestore(callback) {
  const ref = collection(db, "markers");
  onSnapshot(ref, snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        callback({ id: change.doc.id, ...change.doc.data() });
      }
    });
  });
}

// 📌 Borrar marcador de Firestore por ID
export async function borrarMarcadorFirestore(docId) {
  try {
    await deleteDoc(doc(db, "markers", docId));
    console.log("Marcador borrado:", docId);
  } catch (error) {
    console.error("Error borrando marcador:", error);
  }
}


