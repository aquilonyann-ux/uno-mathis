const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.use(express.static(path.join(__dirname, 'public')));

// ── MESSAGES ──────────────────────────────────────────────────
const WIN_MESSAGES = [
  "Bravo Mathis ! Même à 20 ans tu peux encore gagner 😂🎂",
  "20 ans et déjà champion de UNO ! Ta légende commence ! 🏆🎉",
  "Mathis 1 – La vie 0 ! Bonne anniversaire champion ! 🥳",
  "Victoire ! Preuve que l'âge apporte parfois quelque chose 😜",
  "GG EZ ! T'as tout déchiré comme tes cadeaux ce matin 🎁💥",
  "C'est le plus beau cadeau de tes 20 ans ? 🤭🎂",
  "Champion ! Dans 1 an tu pourras plus dire t'as 20 ans, profite ! 😜",
  "À 20 ans Mathis est imbattable au UNO. C'est officiel 👑🎉",
  "Victoire méritée ! Les cartes anniversaire t'ont aidé… un peu 🎊",
  "20 ans et déjà une légende. Certains mettent 80 ans ! 😎",
  "Le roi du UNO est né ! 👑🎈",
  "Même l'IA n'a rien pu faire contre toi. T'es un monstre ! 🤖😤",
  "20 ans, beau, intelligent ET fort au UNO. Trop injuste ! 😂",
  "Vieillir ça a du bon. Maintenant souffle tes bougies ! 🕯️🎂",
  "VICTOIRE ABSOLUE ! Mathis entre dans la légende ! 📜✨",
  "T'as écrasé tout le monde comme un vrai adulte de 20 ans ! 💪",
  "Bonne fête ! T'as fêté tes 20 ans comme il se doit : en gagnant ! 🥂",
  "Les 20 ans t'ont rendu encore plus fort. C'est magique ! 🪄",
  "Et moi qui pensais que t'allais perdre… j'ai eu tort 😅🎂",
  "20 ans de préparation pour ce moment. Bien joué ! 🎓🏅",
  "Tu mérites une tranche de gâteau supplémentaire 🎂",
  "Mathis le conquérant frappe encore ! 🌟🎉",
  "Dans 20 ans tu vas être comment ?! 😱",
  "La plus belle victoire de tes 20 ans ! 🏆",
  "T'as joué comme un dieu ce soir. Bonne anniversaire ! 🧠🎂"
];
const LOSE_MESSAGES = [
  "Même à 20 ans t'arrives pas à gagner à UNO. Certaines choses ne changent pas 😂",
  "Toujours aussi nul malgré 20 ans d'expérience 😭",
  "T'as grandi, mais ton niveau au UNO est resté en maternelle 🍼",
  "20 ans et tu perds encore au UNO. Au moins t'es cohérent 👏",
  "Heureusement qu'on t'aime pas pour tes talents au UNO 😂🎂",
  "20 ans et tu perds encore. BONNE FÊTE quand même ! 🎉",
  "T'as perdu ! Et là je vois déjà ta tête 😂",
  "Même le gâteau joue mieux que toi. Et lui il a pas de mains 🎂",
  "20 bougies, défaite assurée. Appelle-moi la prochaine fois ! 😜",
  "T'es quand même notre Mathis préféré. Même nul au UNO 💕",
  "T'as grandi mais t'as toujours pas appris à jouer 😭😂",
  "Mathis 0 – UNO 1 🎨 (l'art de perdre c'est ton truc)",
  "Au moins t'as 20 ans aujourd'hui. C'est déjà ça ! 🥲",
  "C'est quoi ton excuse ? 'J'avais pas les bonnes cartes' ? 😏",
  "T'as encore 60 ans pour t'améliorer. T'inquiète pas 😅",
  "0 victoire, 20 ans. Le ratio est pas terrible 😂🎉",
  "Même à ton anniversaire les cartes te détestent 🥺",
  "Tu perds tellement bien que c'est presque un talent 🤔",
  "Bonne fête ! Demain tu peux t'entraîner. Aujourd'hui t'es éliminé 😂",
  "Avec l'âge vient la sagesse. Ou pas, visiblement 🤷",
  "Les cartes anniversaire t'ont pas aidé à grand chose ! 🎂",
  "T'as assuré le spectacle, c'est déjà une victoire morale 😂",
  "Mathis champion du monde ? DANS TES RÊVES ! Bonne fête 💕",
  "T'as perdu mais ton sourire lui il gagne toujours 😊",
  "Imprévisible, attachant, et mauvais au UNO 😂🎊"
];

// ── DECK ──────────────────────────────────────────────────────
const COLORS = ['red','blue','green','yellow'];
let cid = 0;
const mk = (color,value,type,extra={}) => ({id:cid++,color,value,type,display:extra.display||value,...extra});

function buildDeck() {
  let d = [];
  COLORS.forEach(c => {
    d.push(mk(c,'0','number',{display:'0'}));
    for(let i=1;i<=9;i++) { d.push(mk(c,String(i),'number')); d.push(mk(c,String(i),'number')); }
    ['skip','reverse','+2'].forEach(t => {
      const disp = t==='skip'?'⊘':t==='reverse'?'↺':'+2';
      d.push(mk(c,disp,t,{display:disp,name:t})); d.push(mk(c,disp,t,{display:disp,name:t}));
    });
  });
  ['wild','+4'].forEach(t => {
    for(let i=0;i<4;i++) d.push(mk('wild',t==='wild'?'W':'+4',t,{display:t==='wild'?'W':'+4',name:t}));
  });
  // Birthday power cards ×2
  [
    {type:'bday-swap',  display:'🔀',name:'Swap',    power:'Échange ta main !'},
    {type:'bday-peek',  display:'👁',  name:'Peek',    power:'Regarde une main !'},
    {type:'bday-shield',display:'🛡', name:'Shield',  power:'Bouclier !'},
    {type:'bday-skip2', display:'⊘⊘',name:'Skip×2',  power:'2 joueurs passent !'},
    {type:'bday-gift',  display:'🎁', name:'Gift',    power:'+2 cartes à un adversaire !'},
  ].forEach(b => {
    d.push(mk('birthday',b.display,b.type,b)); d.push(mk('birthday',b.display,b.type,b));
  });
  return shuffle(d);
}
const shuffle = a => { let r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];} return r; };

// ── ROOMS ─────────────────────────────────────────────────────
const rooms = {};
const genId = () => Math.random().toString(36).substr(2,6).toUpperCase();
const bySocket = sid => Object.values(rooms).find(r=>r.players.some(p=>p.socketId===sid));

function initGame(room) {
  cid = 0;
  const humans = room.players.filter(p=>p.connected);
  let gp = [...humans];
  while(gp.length < 4) gp.push({socketId:null,name:`Bot ${gp.length+1}`,isBot:true,connected:true});

  let deck = buildDeck(), hands = gp.map(()=>[]);
  for(let i=0;i<7;i++) gp.forEach((_,pi)=>hands[pi].push(deck.pop()));

  let sc, tries=0;
  do { sc=deck.shift(); deck.push(sc); sc=deck.pop(); tries++; }
  while((sc.color==='wild'||sc.color==='birthday') && tries<200);

  room.game = {players:gp, hands, deck, discard:[sc],
    currentPlayer:0, direction:1, drawPending:0,
    shielded:Array(gp.length).fill(false), log:[], waitColor:false, pendingWildPi:null};
}

const top = g => g.discard[g.discard.length-1];
const log = (g,m) => { if(!g) return; g.log.unshift(m); if(g.log.length>50) g.log.pop(); };
const adv = g => { g.currentPlayer=(g.currentPlayer+g.direction+g.players.length)%g.players.length; };

function drawFrom(g) {
  if(g.deck.length===0) {
    const t=g.discard.pop(); g.deck=shuffle(g.discard); g.discard=[t];
    log(g,'🔄 Pioche reconstituée.');
  }
  return g.deck.pop();
}

function canPlay(card,g) {
  const t=top(g);
  if(g.drawPending>0) return (card.type==='+2'&&t.type==='+2')||(card.type==='+4');
  if(card.color==='wild'||card.color==='birthday') return true;
  const ac=t.activeColor||t.color;
  if(card.color===ac) return true;
  if(card.type==='number'&&card.value===t.value) return true;
  if(card.type!=='number'&&card.type===t.type) return true;
  return false;
}

function applyEffect(card,g,pi) {
  const n=g.players.length;
  switch(card.type){
    case 'skip': adv(g); log(g,`⊘ ${g.players[g.currentPlayer].name} passe !`); adv(g); break;
    case 'reverse':
      g.direction*=-1;
      if(n===2){adv(g);log(g,'↺ Inversé (=skip à 2J)');adv(g);}
      else{log(g,'↺ Sens inversé !');adv(g);}
      break;
    case '+2': g.drawPending+=2; log(g,`+2 empilé → total ${g.drawPending}`); adv(g); break;
    case '+4': g.drawPending+=4; log(g,`+4 empilé → total ${g.drawPending}`); adv(g); break;
    case 'wild': adv(g); break;
    case 'bday-swap': { const t2=(pi+g.direction+n)%n; [g.hands[pi],g.hands[t2]]=[g.hands[t2],g.hands[pi]]; log(g,`🔀 Main échangée entre ${g.players[pi].name} et ${g.players[t2].name} !`); adv(g); break; }
    case 'bday-peek': log(g,`👁 ${g.players[pi].name} regarde une main !`); adv(g); break;
    case 'bday-shield': g.shielded[pi]=true; log(g,`🛡 ${g.players[pi].name} est protégé !`); adv(g); break;
    case 'bday-skip2': adv(g); log(g,`⊘ ${g.players[g.currentPlayer].name} passe !`); adv(g); log(g,`⊘ ${g.players[g.currentPlayer].name} passe !`); adv(g); break;
    case 'bday-gift': { const t2=(pi+g.direction+n)%n; g.hands[t2].push(drawFrom(g)); g.hands[t2].push(drawFrom(g)); log(g,`🎁 ${g.players[t2].name} reçoit 2 cartes !`); adv(g); break; }
    default: adv(g);
  }
}

function doPlay(room,pi,cardId,color) {
  const g=room.game;
  if(g.currentPlayer!==pi) return {err:'Not your turn'};
  const hand=g.hands[pi], ci=hand.findIndex(c=>c.id===cardId);
  if(ci===-1) return {err:'Card not found'};
  const card=hand[ci];
  if(!canPlay(card,g)) return {err:'Cannot play'};
  hand.splice(ci,1);
  g.discard.push(card);
  log(g,`${g.players[pi].name} joue ${card.name||card.display}`);
  if(card.type==='wild'||card.type==='+4') {
    if(color&&COLORS.includes(color)){
      card.activeColor=color;
      if(card.type==='+4') g.drawPending+=4;
      adv(g);
    } else { g.waitColor=true; g.pendingWildPi=pi; return {needColor:true}; }
  } else { applyEffect(card,g,pi); }
  if(hand.length===0) return {winner:pi};
  return {ok:true};
}

function doDraw(room,pi) {
  const g=room.game;
  if(g.currentPlayer!==pi) return {err:'Not your turn'};
  if(g.drawPending>0) {
    for(let i=0;i<g.drawPending;i++) g.hands[pi].push(drawFrom(g));
    log(g,`${g.players[pi].name} pioche ${g.drawPending} cartes.`);
    g.drawPending=0; adv(g); return {ok:true};
  }
  const card=drawFrom(g); g.hands[pi].push(card);
  log(g,`${g.players[pi].name} pioche une carte.`);
  if(!canPlay(card,g)){ adv(g); return {ok:true}; }
  return {drawnCard:card};
}

function pickMsg(msgs,seen) {
  let av=msgs.map((_,i)=>i).filter(i=>!seen.has(i));
  if(!av.length){seen.clear();av=msgs.map((_,i)=>i);}
  const idx=av[Math.floor(Math.random()*av.length)]; seen.add(idx); return msgs[idx];
}

function endGame(room,wi) {
  room.phase='ended';
  const wname=room.game.players[wi].name;
  const mathisI=room.game.players.findIndex(p=>!p.isBot);
  const mWon=wi===mathisI;
  const msg=mWon?pickMsg(WIN_MESSAGES,room.seenWin):pickMsg(LOSE_MESSAGES,room.seenLose);
  io.to(room.id).emit('game_over',{winnerIdx:wi,winnerName:wname,mathisWon:mWon,message:msg,
    seenWin:room.seenWin.size,seenLose:room.seenLose.size,
    totalWin:WIN_MESSAGES.length,totalLose:LOSE_MESSAGES.length});
}

function broadcast(room) {
  if(!room.game) return;
  const g=room.game;
  room.players.forEach(p=>{
    if(!p.socketId||!p.connected) return;
    const gi=g.players.findIndex(gp=>gp.socketId===p.socketId);
    if(gi===-1) return;
    io.to(p.socketId).emit('game_state',{
      players:g.players.map((gp,i)=>({name:gp.name,isBot:gp.isBot,cardCount:g.hands[i].length,active:i===g.currentPlayer,disconnected:!gp.connected})),
      myHand:g.hands[gi], myIndex:gi,
      discardTop:top(g), deckCount:g.deck.length,
      currentPlayer:g.currentPlayer, direction:g.direction, drawPending:g.drawPending,
      log:g.log.slice(0,15), waitColor:g.waitColor&&g.pendingWildPi===gi, shielded:g.shielded,
    });
  });
}
function broadcastLobby(room) {
  io.to(room.id).emit('lobby_update',{
    roomId:room.id, phase:room.phase,
    players:room.players.map(p=>({name:p.name,connected:p.connected,isHost:p.isHost})),
  });
}

// ── BOT ───────────────────────────────────────────────────────
function botTurn(room) {
  const g=room.game;
  if(!g||room.phase!=='playing') return;
  const pi=g.currentPlayer, p=g.players[pi];
  if(!p||!p.isBot) return;
  setTimeout(()=>{
    if(!room.game||room.phase!=='playing'||g.currentPlayer!==pi) return;
    const hand=g.hands[pi];
    let res;
    if(g.drawPending>0){
      const ctr=hand.find(c=>(c.type==='+2'&&top(g).type==='+2')||c.type==='+4');
      if(ctr){ res=doPlay(room,pi,ctr.id,null); if(res.needColor){const c2=COLORS[Math.floor(Math.random()*4)];top(g).activeColor=c2;g.waitColor=false;g.pendingWildPi=null;adv(g);res={ok:true};} }
      else res=doDraw(room,pi);
    } else {
      const pl=hand.filter(c=>canPlay(c,g));
      if(!pl.length){ res=doDraw(room,pi); }
      else {
        const pri={'+4':10,'+2':9,'skip':8,'reverse':7,'bday-skip2':6,'bday-gift':5,'bday-swap':4,'bday-shield':3,'bday-peek':2};
        const ch=pl.sort((a,b)=>(pri[b.type]||1)-(pri[a.type]||1))[0];
        res=doPlay(room,pi,ch.id,null);
        if(res&&res.needColor){
          const bc=COLORS.reduce((b,c)=>{const cnt=hand.filter(x=>x.color===c).length;return cnt>b.cnt?{c,cnt}:b;},{c:COLORS[0],cnt:-1}).c;
          top(g).activeColor=bc;g.waitColor=false;g.pendingWildPi=null;adv(g);res={ok:true};
        }
      }
    }
    if(res&&res.winner!==undefined){endGame(room,res.winner);return;}
    broadcast(room);
    if(room.phase==='playing'&&g.players[g.currentPlayer]?.isBot) botTurn(room);
  }, 900+Math.random()*700);
}

// ── SOCKET ────────────────────────────────────────────────────
io.on('connection', socket => {
  socket.on('create_room',({playerName})=>{
    const rid=genId();
    rooms[rid]={id:rid,phase:'lobby',
      players:[{socketId:socket.id,name:playerName||'Joueur 1',isBot:false,connected:true,isHost:true}],
      game:null,seenWin:new Set(),seenLose:new Set()};
    socket.join(rid);
    socket.emit('room_created',{roomId:rid,playerIndex:0});
    broadcastLobby(rooms[rid]);
  });

  socket.on('join_room',({roomId,playerName})=>{
    const rid=roomId.toUpperCase(), room=rooms[rid];
    if(!room){socket.emit('error_msg','Salle introuvable !');return;}
    if(room.phase!=='lobby'){socket.emit('error_msg','Partie déjà commencée !');return;}
    room.players.push({socketId:socket.id,name:playerName||`Joueur ${room.players.length+1}`,isBot:false,connected:true,isHost:false});
    socket.join(rid);
    socket.emit('room_joined',{roomId:rid,playerIndex:room.players.length-1});
    broadcastLobby(room);
  });

  socket.on('start_game',()=>{
    const room=bySocket(socket.id);
    if(!room||room.phase!=='lobby') return;
    if(!room.players.find(p=>p.socketId===socket.id&&p.isHost)){socket.emit('error_msg','Seul l\'hôte peut démarrer');return;}
    room.phase='playing'; initGame(room);
    room.players.forEach((p,i)=>{ if(room.game.players[i]) room.game.players[i].socketId=p.socketId; });
    io.to(room.id).emit('game_started');
    broadcast(room);
    if(room.game.players[room.game.currentPlayer].isBot) botTurn(room);
  });

  socket.on('play_card',({cardId,chosenColor})=>{
    const room=bySocket(socket.id); if(!room||room.phase!=='playing') return;
    const gi=room.game.players.findIndex(p=>p.socketId===socket.id); if(gi===-1) return;
    const res=doPlay(room,gi,cardId,chosenColor||null);
    if(res.err){socket.emit('error_msg',res.err);return;}
    if(res.needColor){socket.emit('pick_color');return;}
    if(res.winner!==undefined){endGame(room,res.winner);return;}
    broadcast(room);
    if(room.phase==='playing'&&room.game.players[room.game.currentPlayer]?.isBot) botTurn(room);
  });

  socket.on('choose_color',({color})=>{
    const room=bySocket(socket.id); if(!room||room.phase!=='playing') return;
    const g=room.game, gi=g.players.findIndex(p=>p.socketId===socket.id);
    if(!g.waitColor||g.pendingWildPi!==gi||!COLORS.includes(color)) return;
    top(g).activeColor=color; g.waitColor=false; g.pendingWildPi=null;
    log(g,`${g.players[gi].name} choisit ${color.toUpperCase()} 🎨`); adv(g);
    broadcast(room);
    if(room.phase==='playing'&&g.players[g.currentPlayer]?.isBot) botTurn(room);
  });

  socket.on('draw_card',()=>{
    const room=bySocket(socket.id); if(!room||room.phase!=='playing') return;
    const gi=room.game.players.findIndex(p=>p.socketId===socket.id); if(gi===-1) return;
    const res=doDraw(room,gi);
    if(res.err){socket.emit('error_msg',res.err);return;}
    if(res.drawnCard) socket.emit('drawn_card_playable',{card:res.drawnCard});
    broadcast(room);
    if(room.phase==='playing'&&room.game.players[room.game.currentPlayer]?.isBot) botTurn(room);
  });

  socket.on('peek_result',({targetIdx})=>{
    const room=bySocket(socket.id); if(!room||!room.game) return;
    socket.emit('peek_data',{playerName:room.game.players[targetIdx].name,cards:room.game.hands[targetIdx]});
  });

  socket.on('disconnect',()=>{
    const room=bySocket(socket.id); if(!room) return;
    const p=room.players.find(p=>p.socketId===socket.id);
    if(!p) return;
    p.connected=false;
    if(room.phase==='lobby'){ broadcastLobby(room); return; }
    // In-game: replace with bot
    if(room.game){
      const gi=room.game.players.findIndex(gp=>gp.socketId===socket.id);
      if(gi!==-1){ room.game.players[gi].isBot=true; room.game.players[gi].connected=false; log(room.game,`${p.name} est parti, remplacé par un bot.`); }
      broadcast(room);
      if(room.phase==='playing'&&room.game.players[room.game.currentPlayer]?.isBot) botTurn(room);
    }
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`🎂 UNO Birthday server on :${PORT}`));
