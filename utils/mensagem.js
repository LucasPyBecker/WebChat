function formataMensagem(usuario, texto) {
  return {
    hora: new Date().toLocaleTimeString().substr(0, 5),
    usuario,
    texto
  };
}

module.exports = formataMensagem;
