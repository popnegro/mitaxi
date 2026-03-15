let map, marker, geocoder, mediaRecorder;
let audioChunks = [];
let userLatLng = "", userAddress = "", destAddress = "";
const miTelefono = "5492613871088";

/**
 * Inicializa el mapa de Google
 */
function initMap() {
    const mza = { lat: -32.8895, lng: -68.8458 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15, 
        center: mza, 
        disableDefaultUI: true
    });
    
    marker = new google.maps.Marker({ 
        map: map, 
        position: mza, 
        icon: 'https://maps.google.com/mapfiles/ms/icons/taxi.png' 
    });
    
    geocoder = new google.maps.Geocoder();
    
    obtenerUbicacion();
    configurarBuscadorDestino();
}

/**
 * Obtiene la geolocalización del usuario
 */
function obtenerUbicacion() {
    const icon = document.getElementById('retry-icon');
    icon.classList.add('bi-spin');

    navigator.geolocation.getCurrentPosition((p) => {
        icon.classList.remove('bi-spin');
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        
        // Formato para link de Google Maps
        userLatLng = `https://www.google.com/maps?q=${pos.lat},${pos.lng}`;
        
        marker.setPosition(pos);
        map.setCenter(pos);
        
        geocoder.geocode({ location: pos }, (r, s) => {
            if (s === 'OK') {
                userAddress = r[0].formatted_address;
                document.getElementById('ubicacion-status').innerText = "Ubicación lista ✅";
            }
        });
    }, () => {
        icon.classList.remove('bi-spin');
        alert("Por favor activá el GPS para localizarte mejor.");
    }, { enableHighAccuracy: true });
}

/**
 * Configura el Autocomplete de Google Places
 */
function configurarBuscadorDestino() {
    const input = document.getElementById('destination-input');
    const autocomplete = new google.maps.places.Autocomplete(input, { 
        componentRestrictions: { country: 'ar' } 
    });

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        destAddress = place.formatted_address;
        document.getElementById('price-container').classList.remove('d-none');

        // Calcular Precio
        const o = marker.getPosition();
        const d = place.geometry.location;
        calcularPrecio(o.lat(), o.lng(), d.lat(), d.lng());

        // Ajustar Mapa
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(o);
        bounds.extend(d);
        map.fitBounds(bounds);
    });
}

/**
 * Calcula distancia haversine y precio estimado
 */
function calcularPrecio(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) * 1.3; // +30% por curvas de calles

    const total = 950 + (dist * 550); // Tarifa base + km (Mendoza)
    document.getElementById('estimated-price').innerText = `$${Math.round(total).toLocaleString('es-AR')}`;
}

/**
 * Muestra/Oculta el campo de cambio según método de pago
 */
function toggleCambio(v) {
    document.getElementById('cambio-container').classList.toggle('d-none', v !== 'Efectivo');
}

/**
 * Lógica de Grabación de Audio
 */
document.getElementById('btn-audio').addEventListener('click', async () => {
    const status = document.getElementById('audio-status');
    const btn = document.getElementById('btn-audio');

    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.start();
            
            status.classList.remove('d-none');
            btn.classList.replace('btn-outline-danger', 'btn-danger');
        } catch (err) {
            alert("No se pudo acceder al micrófono.");
        }
    } else {
        mediaRecorder.stop();
        status.classList.add('d-none');
        btn.classList.replace('btn-danger', 'btn-outline-danger');
        alert("Audio grabado. Avisaremos al chofer para que lo escuche al llegar.");
    }
});

/**
 * Valida el formulario y redirige a WhatsApp
 */
function validarYEnviar(e) {
    e.preventDefault();
    const nombre = document.getElementById('user-name').value;
    if (!nombre) return alert("Por favor, ingresá tu nombre.");

    const precio = document.getElementById('estimated-price').innerText;
    const pago = document.getElementById('metodo-pago').value;
    const pagaCon = document.getElementById('paga-con').value;
    const obs = document.getElementById('observaciones').value;

    let texto = `🚕 *NUEVO PEDIDO - TAXIGO*\n👤 *Pasajero:* ${nombre}\n📍 *Origen:* ${userAddress}\n🏁 *Destino:* ${destAddress || 'A definir en el móvil'}\n💰 *Precio Est.:* ${precio}\n💳 *Pago:* ${pago}${pagaCon ? ' (Paga con $' + pagaCon + ')' : ''}`;
    
    if (obs) texto += `\n📝 *Notas:* ${obs}`;
    if (audioChunks.length > 0) texto += `\n🎙️ *Aviso:* El pasajero tiene un audio grabado.`;
    texto += `\n🗺️ *Ubicación Actual:* ${userLatLng}`;

    const urlWhatsapp = `https://wa.me/${miTelefono}?text=${encodeURIComponent(texto)}`;
    window.open(urlWhatsapp, '_blank');

    // Mostrar sección SOS y Modal
    document.getElementById('sos-container').classList.remove('d-none');
    const modal = new bootstrap.Modal(document.getElementById('modalExito'));
    modal.show();
}

/**
 * Botón SOS para compartir con familiares
 */
function activarSOS() {
    const msg = `🚨 *SOS SEGURIDAD*\nEstoy viajando en un TaxiGO hacia ${destAddress || 'mi destino'}. Seguí mi recorrido por favor.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    alert("Se abrió WhatsApp. Ahora compartí tu 'Ubicación en Tiempo Real' con tu contacto de confianza.");
}