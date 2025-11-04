import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBV-8tyGvx7z51EenCnd2QoT9dvuvmch4Q",
  authDomain: "mapa-taxco.firebaseapp.com",
  projectId: "mapa-taxco",
  storageBucket: "mapa-taxco.appspot.com",
  messagingSenderId: "529569034869",
  appId: "1:529569034869:web:d67fe8eac365778600fe3c"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function iniciarSesion() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
}

// Inicializar Firebase



// Guardar marcador en Firestore
export async function guardarMarcadorFirestore(marcador) {
  try {
    await addDoc(collection(db, "marcadores"), marcador);
  } catch (error) {
    console.error("Error al guardar marcador:", error);
  }
}

// Cargar todos los marcadores
export async function cargarMarcadoresFirestore(callback) {
  try {
    const querySnapshot = await getDocs(collection(db, "marcadores"));
    querySnapshot.forEach(doc => callback(doc.data()));
  } catch (error) {
    console.error("Error al cargar marcadores:", error);
  }
}

// Borrar marcador específico
export async function borrarMarcadorFirestore(datos) {
  try {
    const q = query(
      collection(db, "marcadores"),
      where("lat", "==", datos.lat),
      where("lng", "==", datos.lng),
      where("nota", "==", datos.nota)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(async (docu) => {
      await deleteDoc(doc(db, "marcadores", docu.id));
    });
  } catch (error) {
    console.error("Error al borrar marcador:", error);
  }
}



