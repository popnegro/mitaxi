function verificarLogin() {
    if (document.getElementById('admin-pass').value === "MiTaxi2026") {
        sessionStorage.setItem('adminAutenticado', 'true');
        location.reload();
    } else { alert("Clave incorrecta"); }
}

function cargarDatosAdmin() {
    const pedidos = JSON.parse(localStorage.getItem('todosLosPedidos') || '[]');
    document.getElementById('lista-pedidos').innerHTML = pedidos.map(p => `
        <tr><td>${p.nombre}</td>
        <td><button onclick="enviarWhatsApp('${p.telefono}', '${p.destino}')">WhatsApp</button>
        <button onclick="completarPedido('${p.id}')">Finalizar</button></td></tr>`).join('');
}

function enviarWhatsApp(tel, destino) {
    const msg = document.getElementById('selector-mensajes').value;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg + ' Destino: ' + destino)}`);
}

function cerrarSesion() {
    sessionStorage.removeItem('adminAutenticado');
    location.reload();
}

window.onload = () => {
    if (sessionStorage.getItem('adminAutenticado')) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        cargarDatosAdmin();
    }
};