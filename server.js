
const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const formataMensagem = require('./utils/mensagem');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Configura a pasta de arquivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Array que armazena os usuarios conactados
const usuarios = [];

// Executa quando o usuario conecta
io.on('connection', socket => {
  console.log(`Usuario conectado ID: ${socket.id}`);

  // Executa quando recebe do usuario o comando "entrar"
  socket.on('entrar', ({ nome, sala }) => {
    // Inclui usuario na lista de usuarios
    usuarios.push({ id: socket.id, nome, sala });
    // Inclui usuario na sessão do socket
    socket.join(sala);
    // Envia mensagem para todos usuarios da sessão menos o que entrou
    socket.broadcast.to(sala).emit('mensagem', formataMensagem(nome, ` entrou na sala`));
    // Envia informações da sala e a lista de usuários
    io.to(sala).emit('info sala', { sala: sala, usuarios: usuarios.filter(u => u.sala === sala) });

    console.log(`Usuario ${nome} entrou na sala ${sala}`);
  });

  // Escuta o evento "mensagem chat"
  socket.on('mensagem chat', mensagem => {
    const usuario = usuarios.find(usuario => usuario.id === socket.id);

    socket.broadcast.to(usuario.sala).emit('mensagem', formataMensagem(usuario.nome, mensagem));
  });

  // Executa quendo o usuario fecha ou muda de página
  socket.on('disconnect', () => {
    // Encontra o indice do usuario no array de usuarios
    const index = usuarios.findIndex(usuario => usuario.id === socket.id);

    if (index !== -1) {
      // Copia os dados do usuario que sai
      const usuario = usuarios[index];
      // Retira o usuario do array de usuarios
      usuarios.splice(index, 1);
      // Envia mensagem comunicando a saida do usuario
      io.to(usuario.sala).emit('mensagem', formataMensagem(usuario.nome, ` saiu da sala`));
      // Envia lista atualizada de usuários na sala
      io.to(usuario.sala).emit('info sala', { sala: usuario.sala, usuarios: usuarios.filter(u => u.sala === usuario.sala) });

      console.log(`Usuario ${usuario.nome} saiu da sala ${usuario.sala}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
