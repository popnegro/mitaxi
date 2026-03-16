function iniciarPedido() {
    const pedido = {
        id: Date.now().toString().slice(-5),
        nombre: document.getElementById('nombre').value,
        destino: document.getElementById('destino').value,
        telefono: document.getElementById('telefono').value,
        pago: document.getElementById('pago').value
    };

    if (!/^[0-9]{10,}$/.test(pedido.telefono)) {
        return alert("Teléfono inválido (min 10 dígitos).");
    }

    let pedidos = JSON.parse(localStorage.getItem('todosLosPedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('todosLosPedidos', JSON.stringify(pedidos));
    alert("¡Pedido realizado!");
}