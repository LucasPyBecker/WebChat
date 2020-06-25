var elementoSala = document.getElementById('sala');
var elementoUsuarios = document.getElementById('usuarios');
var elementoMensagens = document.querySelector('.mensagens');
var elementoForm = document.getElementById('form');

// Captura os valores de usuario do URL
var { nome, sala } = parsedQueryString();

// Se não receber o nome ou a sala redireciona para tela inicial
if (!nome || !sala) window.location.replace(`${location.protocol}//${location.hostname}:${location.port}/index.html`);

// Cria a conexão socket
var socket = io();

// Emite o comando "Entrar" e envia as variaveis nome e sala para o servidor
socket.emit('entrar', { nome, sala });

// Atualiza a lista de usuarios da sala
socket.on('info sala', ({ sala, usuarios }) => {
  elementoSala.innerText = sala;
  elementoUsuarios.innerHTML = `${usuarios.map(usuario => `<li>${usuario.nome}</li>`).join('')}`;
});

// Executa quando comando "mensagem" é recebido
socket.on('mensagem', mensagem => {
  // Cria o elemento div e inclui a mensagem na tela
  var div = document.createElement('div');
  div.classList.add('mensagem');
  div.innerHTML = `<span>${mensagem.hora}</span> <strong>${mensagem.usuario}:</strong> <span>${mensagem.texto}</span>`;
  document.querySelector('.mensagens').appendChild(div);
  
  // Rola a lista de mensagens pra baixo
  elementoMensagens.scrollTop = elementoMensagens.scrollHeight;
});

// Envia Mensagem
elementoForm.addEventListener('submit', e => {
  e.preventDefault();
  var hora = new Date().toLocaleTimeString().substr(0, 5);
  var texto = e.target.elements.mensagem.value
  // Cria o elemento div e inclui a mensagem na tela
  var div = document.createElement('div');
  div.classList.add('mensagem-usuario');
  div.innerHTML = `<span>${hora}</span> <strong>'Você':</strong> <span>${texto}</span>`;
  document.querySelector('.mensagens').appendChild(div);
  
  // Emite mensagem para o servidor
  socket.emit('mensagem chat', texto);

  // Limpa campo input do formulario
  e.target.elements.mensagem.value = '';
  e.target.elements.mensagem.focus();
});

function parsedQueryString() {
  var query = location.search.slice(1);
  var partes = query.split('&');
  var data = {};

  partes.forEach(function (parte) {
    var chaveValor = parte.split('=');
    var chave = chaveValor[0];
    var valor = chaveValor[1];
    data[chave] = valor;
  });

  return data;
};
