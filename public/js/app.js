/* global io */
var socket = io();
var currentRoomId = null;
var currentMode = null;
var selectedClasse = 0;
var myName = '';

// ========== SCREEN MANAGEMENT ==========

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function showToast(msg) {
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3000);
}

// ========== MENU ACTIONS ==========

function startGame(mode) {
  currentMode = mode;
  socket.emit('create-game', { mode: mode });
}

function joinGame() {
  var roomId = document.getElementById('join-room-id').value.trim().toUpperCase();
  if (!roomId) {
    showToast('Digite o codigo da sala');
    return;
  }
  currentRoomId = roomId;
  socket.emit('join-game', { roomId: roomId });
}

function selectClasse(el) {
  document.querySelectorAll('.class-option').forEach(function(c) {
    c.classList.remove('selected');
  });
  el.classList.add('selected');
  selectedClasse = parseInt(el.getAttribute('data-classe'), 10);
}

function confirmSetup() {
  var name = document.getElementById('player-name').value.trim();
  if (!name) {
    showToast('Digite seu nome');
    return;
  }
  myName = name;
  var deckSelect = document.getElementById('deck-choice');
  var deckName = deckSelect.value || undefined;

  socket.emit('set-player-info', {
    roomId: currentRoomId,
    nome: name,
    classe: selectedClasse,
    deckName: deckName,
  });
}

// ========== SOCKET EVENTS ==========

socket.on('game-created', function(data) {
  currentRoomId = data.roomId;
  socket.emit('list-decks');
  showScreen('screen-setup');
});

socket.on('joined-game', function(data) {
  currentRoomId = data.roomId;
  socket.emit('list-decks');
  showScreen('screen-setup');
});

socket.on('deck-list', function(data) {
  var select = document.getElementById('deck-choice');
  select.innerHTML = '<option value="">Deck Padrao</option>';
  data.decks.forEach(function(name) {
    var opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
});

socket.on('waiting-opponent', function() {
  document.getElementById('lobby-room-id').textContent = currentRoomId;
  showScreen('screen-lobby');
});

socket.on('game-start', function(data) {
  document.getElementById('opp-name').textContent = data.opponent.nome;
  document.getElementById('my-name').textContent = myName;
  clearLog();
  showScreen('screen-game');
});

socket.on('error-msg', function(data) {
  showToast(data.message);
});

socket.on('player-disconnected', function() {
  showToast('Oponente desconectou');
});

// ========== GAME EVENTS ==========

socket.on('turn-start', function(data) {
  addLog('--- Turno de ' + data.jogador + ' ---', '');
});

socket.on('turn-info', function(data) {
  var msg = data.jogador + ' | Vida: ' + data.vidaInicial;
  if (data.danoVeneno > 0) {
    msg += ' | Veneno: -' + data.danoVeneno;
    addLog(msg, 'log-poison');
  }
});

socket.on('board-update', function(data) {
  updateBoard(data.jogador, data.oponente);
  renderHand(data.mao, data.jogador.mana);
  document.getElementById('btn-pass').style.display = 'inline-block';
});

socket.on('request-card', function(data) {
  renderHand(data.mao, data.mana);
  document.getElementById('btn-pass').style.display = 'inline-block';
});

socket.on('card-played', function(data) {
  addLog('Carta jogada: ' + data.carta.tipoNome + ' ' + data.carta.valor, 'log-' + getLogClass(data.carta.tipoNome));
});

socket.on('damage-dealt', function(data) {
  addLog(data.alvo + ' sofreu ' + data.dano + ' de dano (vida: ' + data.vidaRestante + ')', 'log-damage');
  flashEffect('damage');
});

socket.on('heal', function(data) {
  addLog('Curou ' + data.cura + ' (vida: ' + data.vidaTotal + ')', 'log-heal');
  flashEffect('heal');
});

socket.on('buff-applied', function(data) {
  addLog('Buff de ' + data.percentual + '% aplicado', 'log-buff');
});

socket.on('buff-on-card', function(data) {
  addLog('Bonus de ' + data.percentual + '% nesta acao', 'log-buff');
});

socket.on('shield', function(data) {
  addLog('Escudo ativado: ' + data.valor, 'log-shield');
});

socket.on('extra-mana', function(data) {
  addLog('Mana extra: +' + data.valor, 'log-mana');
});

socket.on('poison', function(data) {
  addLog('Veneno aplicado: ' + data.duracao + ' turno(s)', 'log-poison');
});

socket.on('game-over', function(data) {
  var title = document.getElementById('gameover-title');
  var msg = document.getElementById('gameover-msg');
  if (data.draw) {
    title.textContent = 'Empate!';
    msg.textContent = 'Ambos os jogadores foram derrotados.';
  } else if (data.winner === myName) {
    title.textContent = 'Vitoria!';
    msg.textContent = 'Parabens, voce venceu!';
  } else {
    title.textContent = 'Derrota';
    msg.textContent = data.winner + ' venceu a partida.';
  }
  showScreen('screen-gameover');
});

// ========== GAME UI HELPERS ==========

function updateBoard(jogador, oponente) {
  document.getElementById('my-life').textContent = jogador.vida;
  document.getElementById('my-shields').textContent = jogador.escudos.length;
  document.getElementById('my-poison').textContent = jogador.venenos.length;
  document.getElementById('my-mana').textContent = jogador.mana + '/' + jogador.manaSlot;

  document.getElementById('opp-life').textContent = oponente.vida;
  document.getElementById('opp-shields').textContent = oponente.escudos.length;
  document.getElementById('opp-poison').textContent = oponente.venenos.length;

  // Opponent hand (face down)
  var oppHand = document.getElementById('opp-hand');
  oppHand.innerHTML = '';
  for (var i = 0; i < oponente.maoSize; i++) {
    var cardBack = document.createElement('div');
    cardBack.className = 'card card-back';
    oppHand.appendChild(cardBack);
  }
}

function renderHand(mao, mana) {
  var hand = document.getElementById('my-hand');
  hand.innerHTML = '';

  var typeClasses = {
    'Ataque': 'card-ataque',
    'Cura': 'card-cura',
    'Buff': 'card-buff',
    'Escudo': 'card-escudo',
    'Mana': 'card-mana',
    'Veneno': 'card-veneno'
  };

  mao.forEach(function(c, index) {
    var card = document.createElement('div');
    var typeClass = typeClasses[c.tipoNome] || 'card-ataque';
    var disabled = c.custo > mana;
    card.className = 'card ' + typeClass + (disabled ? ' card-disabled' : '');

    card.innerHTML =
      '<div class="card-cost">' + c.custo + '</div>' +
      '<div class="card-type">' + c.tipoNome + '</div>' +
      '<div class="card-value">' + c.valor + '</div>';

    if (!disabled) {
      card.onclick = function() {
        selectCard(index);
      };
    }
    hand.appendChild(card);
  });
}

function selectCard(index) {
  document.getElementById('btn-pass').style.display = 'none';
  document.getElementById('my-hand').innerHTML = '';
  socket.emit('select-card', { cardIndex: index });
}

function passTurn() {
  document.getElementById('btn-pass').style.display = 'none';
  document.getElementById('my-hand').innerHTML = '';
  socket.emit('pass-turn');
}

// ========== LOG ==========

function clearLog() {
  document.getElementById('game-log').innerHTML = '';
}

function addLog(text, cls) {
  var log = document.getElementById('game-log');
  var entry = document.createElement('div');
  entry.className = 'log-entry ' + (cls || '');
  entry.textContent = text;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function getLogClass(tipoNome) {
  var map = {
    'Ataque': 'damage',
    'Cura': 'heal',
    'Buff': 'buff',
    'Escudo': 'shield',
    'Mana': 'mana',
    'Veneno': 'poison'
  };
  return map[tipoNome] || '';
}

function flashEffect(type) {
  var area = document.querySelector('.effect-area');
  area.style.transition = 'background 0.15s';
  if (type === 'damage') {
    area.style.background = 'rgba(231, 76, 60, 0.2)';
  } else if (type === 'heal') {
    area.style.background = 'rgba(46, 204, 113, 0.2)';
  }
  setTimeout(function() {
    area.style.background = 'transparent';
  }, 300);
}

// ========== DRAFT ==========

var draftRoomId = null;
var draftDeckCards = [];

function showDraftScreen() {
  draftDeckCards = [];
  updateDraftDeckPreview();
  showScreen('screen-draft');
}

// Override draft button from menu
var originalShowScreen = showScreen;
document.querySelector('[onclick="showScreen(\'screen-draft\')"]').onclick = function() {
  draftDeckCards = [];
  draftRoomId = 'DRAFT-' + Math.random().toString(36).substring(2, 8);
  socket.emit('create-game', { mode: 'single' });
};

socket.on('connect', function() {
  // When we come back from draft creation, we handle it specially
});

// Intercept game-created for draft
var originalGameCreated = null;
(function() {
  var waitingForDraft = false;

  var origStartGame = window.startGame;

  // We already have the listener above, but need to handle draft flow
  // The draft doesn't need a game room - we handle it locally for simplicity

  document.querySelector('[onclick="showScreen(\'screen-draft\')"]').onclick = function() {
    draftDeckCards = [];
    updateDraftDeckPreview();
    document.getElementById('draft-back-btn').style.display = 'none';
    startLocalDraft();
    showScreen('screen-draft');
  };
})();

function startLocalDraft() {
  var boosterIndex = 0;
  var totalBoosters = 10;

  function generateRandomCard() {
    var tipos = ['Ataque', 'Cura', 'Buff', 'Escudo', 'Mana', 'Veneno'];
    var tipoEnums = [0, 1, 2, 3, 4, 5];
    var idx = Math.floor(Math.random() * 6);
    var valor = Math.floor(Math.random() * 8) + 1;
    return {
      tipo: tipoEnums[idx],
      tipoNome: tipos[idx],
      custo: valor,
      valor: valor
    };
  }

  function generateBooster() {
    var cards = [];
    for (var i = 0; i < 8; i++) {
      cards.push(generateRandomCard());
    }
    return cards;
  }

  function showBooster() {
    if (boosterIndex >= totalBoosters) {
      // Draft complete
      addDraftLog('Draft completo! ' + draftDeckCards.length + ' cartas no deck.');
      document.getElementById('draft-back-btn').style.display = 'inline-block';

      // Save deck via server
      saveDraftDeck();
      return;
    }

    var booster = generateBooster();
    var picksLeft = 4;

    document.getElementById('draft-booster-num').textContent =
      'Booster ' + (boosterIndex + 1) + '/' + totalBoosters;

    function renderBooster() {
      document.getElementById('draft-picks-left').textContent =
        'Escolhas restantes: ' + picksLeft;

      var container = document.getElementById('draft-cards');
      container.innerHTML = '';

      var typeClasses = {
        'Ataque': 'card-ataque',
        'Cura': 'card-cura',
        'Buff': 'card-buff',
        'Escudo': 'card-escudo',
        'Mana': 'card-mana',
        'Veneno': 'card-veneno'
      };

      booster.forEach(function(c, i) {
        var card = document.createElement('div');
        card.className = 'card ' + (typeClasses[c.tipoNome] || 'card-ataque');
        card.innerHTML =
          '<div class="card-cost">' + c.custo + '</div>' +
          '<div class="card-type">' + c.tipoNome + '</div>' +
          '<div class="card-value">' + c.valor + '</div>';
        card.onclick = function() {
          draftDeckCards.push(booster.splice(i, 1)[0]);
          updateDraftDeckPreview();
          picksLeft--;
          if (picksLeft <= 0) {
            boosterIndex++;
            showBooster();
          } else {
            renderBooster();
          }
        };
        container.appendChild(card);
      });
    }

    renderBooster();
  }

  showBooster();
}

function updateDraftDeckPreview() {
  document.getElementById('draft-deck-count').textContent = draftDeckCards.length;
  var list = document.getElementById('draft-deck-list');
  list.innerHTML = '';

  var typeClasses = {
    'Ataque': 'card-ataque',
    'Cura': 'card-cura',
    'Buff': 'card-buff',
    'Escudo': 'card-escudo',
    'Mana': 'card-mana',
    'Veneno': 'card-veneno'
  };

  draftDeckCards.forEach(function(c) {
    var mini = document.createElement('span');
    mini.className = 'draft-mini-card ' + (typeClasses[c.tipoNome] || '');
    mini.textContent = c.tipoNome + ' ' + c.valor;
    list.appendChild(mini);
  });
}

function addDraftLog(text) {
  var info = document.getElementById('draft-picks-left');
  info.textContent = text;
}

function saveDraftDeck() {
  var name = prompt('Nome do deck:');
  if (!name) return;

  // Save via a simple POST or socket event
  // For simplicity we'll use socket to ask server to save
  socket.emit('save-draft-deck', { name: name, cards: draftDeckCards });
}

socket.on('deck-saved', function() {
  showToast('Deck salvo com sucesso!');
});
