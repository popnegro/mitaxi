// Configuración del Mapa (Leaflet)
let map = L.map('map').setView([-32.8895, -68.8458], 13); // Mendoza, Argentina
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function iniciarPedido() {
    // 1. Captura de elementos del DOM
    const nombre = document.getElementById('nombre').value;
    const destino = document.getElementById('destino').value;
    const telefono = document.getElementById('telefono').value;
    const pago = document.getElementById('pago').value;

    // 2. Validación de campos
    if (!nombre || !destino || !telefono) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    // 3. Validación de teléfono (mínimo 10 dígitos)
    const regexTel = /^[0-9]{10,}$/;
    if (!regexTel.test(telefono)) {
        alert("Ingresa un número de teléfono válido (mínimo 10 números, sin espacios).");
        return;
    }

    // 4. Crear el objeto del pedido
    const nuevoPedido = {
        id: Date.now().toString().slice(-5),
        nombre: nombre,
        destino: destino,
        telefono: telefono,
        pago: pago,
        estado: "Pendiente",
        fecha: new Date().toLocaleString()
    };

    // 5. Persistencia en LocalStorage
    let pedidosActivos = JSON.parse(localStorage.getItem('todosLosPedidos') || '[]');
    pedidosActivos.push(nuevoPedido);
    localStorage.setItem('todosLosPedidos', JSON.stringify(pedidosActivos));

    // 6. Feedback al usuario
    alert(`¡Gracias ${nombre}! Tu pedido a ${destino} ha sido enviado.`);
    
    // Opcional: Limpiar formulario
    document.getElementById('form-pedido').reset();
}