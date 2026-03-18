const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

const WIN_MESSAGES = [
  "Bravo Mathis ! Même à 20 ans tu peux encore gagner contre tes vieux… ou pas 😂🎂",
  "20 ans et déjà champion de UNO ! Ta légende commence aujourd'hui. 🏆🎉",
  "Mathis 1 – La vie 0 ! Bonne anniversaire mon champion ! 🥳",
  "Victoire ! Preuve que l'âge apporte parfois quelque chose 😜 Bonne fête !",
  "GG EZ ! T'as tout déchiré comme tes cadeaux ce matin. 🎁💥",
  "Waouw t'as gagné ! C'est le plus beau cadeau de tes 20 ans ? 🤭🎂",
  "Champion ! Et dans 1 an tu pourras plus dire que t'as 20 ans, profite ! 😜",
  "C'est officiel : à 20 ans Mathis est imbattable au UNO. 👑🎉",
  "Victoire méritée ! Les cartes anniversaire ont dû t'aider… un peu. 🎊",
  "Mathis 20 ans et déjà une légende. Certains mettent 80 ans pour y arriver ! 😎",
  "GG ! Tu fêtes tes 20 ans en grande pompe. Le roi du UNO est né ! 👑🎈",
  "Victoire ! Même l'IA n'a rien pu faire contre toi. T'es un monstre ! 🤖😤",
  "Bravo l'artiste ! 20 ans, beau, intelligent ET fort au UNO. Trop injuste ! 😂",
  "Tu viens de prouver que vieillir, ça a du bon. Maintenant souffle tes bougies ! 🕯️🎂",
  "VICTOIRE ABSOLUE ! Mathis entre dans la légende de ses 20 ans ! 📜✨",
  "GG Mathis ! T'as écrasé tout le monde comme un vrai adulte de 20 ans ! 💪",
  "Bonne fête champion ! T'as fêté tes 20 ans comme il se doit : en gagnant ! 🥂",
  "Incroyable ! Les 20 ans t'ont rendu encore plus fort. C'est magique ! 🪄",
  "Victoire ! Et moi qui pensais que t'allais perdre… j'ai eu tort 😅🎂",
  "Master Mathis ! 20 ans de préparation pour ce moment. Bien joué ! 🎓🏅",
  "T'as gagné ! Ce coup-ci j'avoue, tu mérites une tranche de gâteau supplémentaire 🎂",
  "Mathis le conquérant frappe encore ! Personne ne peut l'arrêter 🌟🎉",
  "20 ans et déjà imbattable. Dans 20 ans tu vas être comment ?! 😱",
  "Yesss ! T'as fait honneur à ta journée. La plus belle victoire de tes 20 ans ! 🏆",
  "Bravo ! T'as joué comme un dieu ce soir. Bonne anniversaire petit génie ! 🧠🎂"
];
const LOSE_MESSAGES = [
  "Perdu Mathis… même à 20 ans t'arrives pas à gagner à UNO. Certaines choses ne changent pas 😂",
  "Toujours aussi nul malgré 20 ans d'expérience. C'est un talent en soi ! 😭",
  "Bonne fête grand ! T'as grandi, mais ton niveau au UNO, lui, est resté en maternelle 🍼",
  "20 ans et tu perds encore au UNO. Au moins t'es cohérent 👏",
  "Défaite… Heureusement qu'on t'aime pas pour tes talents au UNO 😂🎂",
  "20 ans et tu perds encore. BONNE FÊTE ! 🎉 (mais vraiment nul)",
  "T'as perdu ! Et là je vois déjà ta tête 😂 Bonne anniversaire quand même !",
  "Même le gâteau joue mieux que toi. Et lui il a pas de mains. 🎂",
  "20 bougies, 20 défaites en herbe. La prochaine fois appelle-moi, je t'aide ! 😜",
  "Perdu ! Mais bon, t'es quand même notre Mathis préféré. Même nul au UNO 💕",
  "LOL ! T'as grandi mais t'as toujours pas appris à jouer. C'est touchant 😭😂",
  "Mathis 0 – UNO 1. Bonne fête l'artiste ! 🎨 (l'art de perdre c'est ton truc)",
  "T'as pas gagné, mais au moins t'as 20 ans aujourd'hui. C'est déjà ça ! 🥲",
  "Défaite cinglante ! C'est quoi ton excuse cette fois ? 'J'avais pas les bonnes cartes' ? 😏",
  "Aw perdu ! Ça va, t'as encore 60 ans pour t'améliorer. T'inquiète pas 😅",
  "0 victoire, 20 ans. Le ratio est pas terrible mon grand 😂🎉",
  "Même à ton anniversaire les cartes te détestent. C'est presque touchant ! 🥺",
  "Tu perds tellement bien que j'commence à croire que c'est un talent 🤔",
  "Bonne fête Mathis ! Demain tu peux t'entraîner. Aujourd'hui t'es éliminé 😂",
  "Encore perdu ! T'inquiète, avec l'âge vient la sagesse. Ou pas, visiblement 🤷",
  "20 ans et tu t'es encore fait rouler. Les cartes anniversaire t'ont pas aidé ! 🎂",
  "Défaite ! Mais t'as assuré le spectacle, c'est déjà une victoire morale 😂",
  "Mathis champion du monde du UNO ? DANS TES RÊVES ! Bonne fête quand même 💕",
  "T'as perdu mais ton sourire lui il gagne toujours. Bonne anniversaire ! 😊",
  "Toujours fidèle à toi-même : imprévisible, attachant, et mauvais au UNO 😂🎊"
];

const COLORS = ['red','blue','green','yellow'];
let cardIdCtr = 0;
function mkCard(color,value,type,extra={}){return{id:cardIdCtr++,color,value,type,display:extra.display||value,...extra};}
function buildDeck(){
  let d=[];
  COLORS.forEach(c=>{
    d.push(mkCard(c,'0','number',{display:'0'}));
    for(let i=1;i<=9;i++){d.push(mkCard(c,String(i),'number',{display:String(i)}));d.push(mkCard(c,String(i),'number',{display:String(i)}));}
    [{type:'skip',display:'⛔',name:'Skip'},{type:'reverse',display:'↔️',name:'Reverse'},{type:'+2',display:'+2',name:'+2'}].forEach(s=>{
      d.push(mkCard(c,s.display,s.type,{display:s.display,name:s.name}));
      d.push(mkCard(c,s.display,s.type,{display:s.display,name:s.name}));
    });
  });
  [{type:'wild',display:'🌈',name:'Joker'},{type:'+4',display:'+4',name:'+4'}].forEach(w=>{
    for(let i=0;i<4;i++)d.push(mkCard('wild',w.display,w.type,{display:w.display,name:w.name}));
  });
  [{type:'bday-swap',display:'🔀',name:'Échange Main',power:'Échange ta main avec un joueur !'},
   {type:'bday-peek',display:'👁️',name:'Regarde Main',power:"Regarde la main d'un adversaire !"},
   {type:'bday-shield',display:'🛡️',name:'Bouclier',power:'Protège-toi du prochain effet !'},
   {type:'bday-skip2',display:'⛔⛔',name:'Double Skip',power:'Fait passer 2 joueurs !'},
   {type:'bday-gift',display:'🎁',name:'Cadeau',power:'Donne 2 cartes à un adversaire !'}
  ].forEach(b=>{
    d.push(mkCard('birthday',b.display,b.type,{display:b.display,name:b.name,power:b.power}));
    d.push(mkCard('birthday',b.display,b.type,{display:b.display,name:b.name,power:b.power}));
  });
  return shuffle(d);
}
function shuffle(a){let r=[...a];for(let i=r.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

const rooms={};
function genId(){return Math.random().toString(36).substr(2,6).toUpperCase();}
function getRoomBySocket(sid){return Object.values(rooms).find(r=>r.players.some(p=>p.socketId===sid));}

function initGame(room){
  let gp=[...room.players];
  while(gp.length<4)gp.push({socketId:null,name:`Bot ${gp.length}`,isBot:true,connected:true});
  cardIdCtr=0;
  let deck=buildDeck();
  let hands=gp.map(()=>[]);
  for(let i=0;i<7;i++)gp.forEach((_,pi)=>hands[pi].push(deck.pop()));
  let sc,tries=0;
  do{sc=deck.shift();deck.push(sc);sc=deck.pop();tries++;}while((sc.color==='wild'||sc.color==='birthday')&&tries<100);
  room.game={players:gp,hands,deck,discard:[sc],currentPlayer:0,direction:1,drawPending:0,shielded:Array(gp.length).fill(false),log:[],waitingForColor:false,pendingWildPlayer:null};
}

function topCard(g){return g.discard[g.discard.length-1];}
function aLog(g,m){if(!g)return;if(!g.log)g.log=[];g.log.unshift(m);if(g.log.length>40)g.log.pop();}
function advance(g){g.currentPlayer=(g.currentPlayer+g.direction+g.players.length)%g.players.length;}
function drawFrom(g){
  if(g.deck.length===0){const t=g.discard.pop();g.deck=shuffle(g.discard);g.discard=[t];aLog(g,'🔄 Pioche reconstituée.');}
  return g.deck.pop();
}
function canPlayCard(card,g){
  const top=topCard(g);
  if(g.drawPending>0){
    if(card.type==='+2'&&top.type==='+2')return true;
    if(card.type==='+4')return true;
    return false;
  }
  if(card.color==='wild'||card.color==='birthday')return true;
  const ac=top.activeColor||top.color;
  if(card.color===ac)return true;
  if(card.type==='number'&&card.value===top.value)return true;
  if(card.type!=='number'&&card.type===top.type)return true;
  return false;
}
function applyEffect(card,g,pi){
  const n=g.players.length;
  switch(card.type){
    case'skip':advance(g);aLog(g,`⛔ ${g.players[g.currentPlayer].name} passe !`);advance(g);break;
    case'reverse':g.direction*=-1;if(n===2){advance(g);advance(g);}else{aLog(g,'↔️ Sens inversé !');advance(g);}break;
    case'+2':g.drawPending+=2;aLog(g,`+2 empilé! Total:${g.drawPending}`);advance(g);break;
    case'+4':g.drawPending+=4;aLog(g,`+4 empilé! Total:${g.drawPending}`);advance(g);break;
    case'wild':advance(g);break;
    case'bday-swap':{const t=(pi+g.direction+n)%n;[g.hands[pi],g.hands[t]]=[g.hands[t],g.hands[pi]];aLog(g,`🔀 Main échangée entre ${g.players[pi].name} et ${g.players[t].name}!`);advance(g);break;}
    case'bday-peek':aLog(g,`👁️ ${g.players[pi].name} regarde une main!`);advance(g);break;
    case'bday-shield':g.shielded[pi]=true;aLog(g,`🛡️ ${g.players[pi].name} est protégé!`);advance(g);break;
    case'bday-skip2':advance(g);aLog(g,`⛔⛔ ${g.players[g.currentPlayer].name} passe!`);advance(g);aLog(g,`⛔⛔ ${g.players[g.currentPlayer].name} passe!`);advance(g);break;
    case'bday-gift':{const t=(pi+g.direction+n)%n;g.hands[t].push(drawFrom(g));g.hands[t].push(drawFrom(g));aLog(g,`🎁 ${g.players[t].name} reçoit 2 cartes!`);advance(g);break;}
    default:advance(g);
  }
}

function processPlay(room,pi,cardId,chosenColor){
  const g=room.game;
  if(g.currentPlayer!==pi)return{error:'Not your turn'};
  if(g.waitingForColor&&g.pendingWildPlayer!==pi)return{error:'Waiting for color'};
  const hand=g.hands[pi];
  const ci=hand.findIndex(c=>c.id===cardId);
  if(ci===-1)return{error:'Card not found'};
  const card=hand[ci];
  if(!canPlayCard(card,g))return{error:'Cannot play'};
  hand.splice(ci,1);
  g.discard.push(card);
  aLog(g,`${g.players[pi].name} joue ${card.name||card.display}`);
  if(card.type==='wild'||card.type==='+4'){
    if(chosenColor&&COLORS.includes(chosenColor)){
      card.activeColor=chosenColor;
      if(card.type==='+4')g.drawPending+=4;
      advance(g);
    }else{g.waitingForColor=true;g.pendingWildPlayer=pi;return{needColor:true};}
  }else{applyEffect(card,g,pi);}
  if(hand.length===0)return{winner:pi};
  return{ok:true};
}

function processDrawOrPass(room,pi){
  const g=room.game;
  if(g.currentPlayer!==pi)return{error:'Not your turn'};
  if(g.drawPending>0){
    for(let i=0;i<g.drawPending;i++)g.hands[pi].push(drawFrom(g));
    aLog(g,`${g.players[pi].name} pioche ${g.drawPending} cartes.`);
    g.drawPending=0;advance(g);
  }else{
    const card=drawFrom(g);g.hands[pi].push(card);
    aLog(g,`${g.players[pi].name} pioche une carte.`);
    if(!canPlayCard(card,g))advance(g);
    else return{drawnCard:card};
  }
  return{ok:true};
}

function botPlay(room){
  const g=room.game;
  if(!g||room.phase!=='playing')return;
  const pi=g.currentPlayer;
  const p=g.players[pi];
  if(!p||!p.isBot)return;
  setTimeout(()=>{
    if(!room.game||room.phase!=='playing')return;
    const hand=g.hands[pi];
    let result;
    if(g.drawPending>0){
      const ctr=hand.find(c=>(c.type==='+2'&&topCard(g).type==='+2')||c.type==='+4');
      if(ctr){result=processPlay(room,pi,ctr.id,null);if(result.needColor){const col=COLORS[Math.floor(Math.random()*4)];topCard(g).activeColor=col;g.waitingForColor=false;g.pendingWildPlayer=null;advance(g);result={ok:true};}}
      else{result=processDrawOrPass(room,pi);}
    }else{
      const pl=hand.filter(c=>canPlayCard(c,g));
      if(pl.length===0){result=processDrawOrPass(room,pi);}
      else{
        const pri=c=>({'+4':10,'+2':9,'skip':8,'reverse':7,'bday-skip2':6,'bday-gift':5,'bday-swap':4,'bday-shield':3,'bday-peek':2}[c.type]||1);
        const ch=pl.sort((a,b)=>pri(b)-pri(a))[0];
        result=processPlay(room,pi,ch.id,null);
        if(result&&result.needColor){
          const bc=COLORS.reduce((b,c)=>{const cnt=hand.filter(x=>x.color===c).length;return cnt>b.cnt?{c,cnt}:b;},{c:COLORS[0],cnt:-1}).c;
          topCard(g).activeColor=bc;g.waitingForColor=false;g.pendingWildPlayer=null;advance(g);result={ok:true};
        }
      }
    }
    if(result&&result.winner!==undefined){endGame(room,result.winner);return;}
    broadcastState(room);
    if(room.phase==='playing'&&g.players[g.currentPlayer]&&g.players[g.currentPlayer].isBot)botPlay(room);
  },900+Math.random()*600);
}

function pickMsg(msgs,seen){
  let av=msgs.map((_,i)=>i).filter(i=>!seen.has(i));
  if(!av.length){seen.clear();av=msgs.map((_,i)=>i);}
  const idx=av[Math.floor(Math.random()*av.length)];seen.add(idx);return msgs[idx];
}

function endGame(room,wi){
  room.phase='ended';
  const wname=room.game.players[wi].name;
  const mathisIdx=room.game.players.findIndex(p=>!p.isBot);
  const mWon=wi===mathisIdx;
  const msg=mWon?pickMsg(WIN_MESSAGES,room.seenWin):pickMsg(LOSE_MESSAGES,room.seenLose);
  io.to(room.id).emit('game_over',{winnerIdx:wi,winnerName:wname,mathisWon:mWon,message:msg,seenWin:room.seenWin.size,seenLose:room.seenLose.size,totalWin:WIN_MESSAGES.length,totalLose:LOSE_MESSAGES.length});
}

function broadcastState(room){
  if(!room.game)return;
  const g=room.game;
  room.players.forEach((p)=>{
    if(!p.socketId||!p.connected)return;
    const gi=g.players.findIndex(gp=>gp.socketId===p.socketId);
    if(gi===-1)return;
    const state={
      players:g.players.map((gp,i)=>({name:gp.name,isBot:gp.isBot,cardCount:g.hands[i].length,isCurrentPlayer:i===g.currentPlayer})),
      myHand:g.hands[gi],myIndex:gi,
      discardTop:topCard(g),deckCount:g.deck.length,
      currentPlayer:g.currentPlayer,direction:g.direction,drawPending:g.drawPending,
      log:g.log.slice(0,12),
      waitingForColor:g.waitingForColor&&g.pendingWildPlayer===gi,
      shielded:g.shielded,
    };
    io.to(p.socketId).emit('game_state',state);
  });
}
function broadcastLobby(room){
  io.to(room.id).emit('lobby_update',{roomId:room.id,players:room.players.map(p=>({name:p.name,connected:p.connected})),phase:room.phase});
}

io.on('connection',(socket)=>{
  console.log('Connect:',socket.id);

  socket.on('create_room',({playerName})=>{
    const rid=genId();
    rooms[rid]={id:rid,phase:'lobby',players:[{socketId:socket.id,name:playerName||'Joueur 1',isBot:false,connected:true}],game:null,seenWin:new Set(),seenLose:new Set()};
    socket.join(rid);
    socket.emit('room_created',{roomId:rid,playerIndex:0});
    broadcastLobby(rooms[rid]);
  });

  socket.on('join_room',({roomId,playerName})=>{
    const rid=roomId.toUpperCase();
    const room=rooms[rid];
    if(!room){socket.emit('error_msg','Salle introuvable !');return;}
    if(room.phase!=='lobby'){socket.emit('error_msg','Partie déjà commencée !');return;}
    if(room.players.length>=4){socket.emit('error_msg','Salle pleine !');return;}
    room.players.push({socketId:socket.id,name:playerName||`Joueur ${room.players.length+1}`,isBot:false,connected:true});
    socket.join(rid);
    socket.emit('room_joined',{roomId:rid,playerIndex:room.players.length-1});
    broadcastLobby(room);
  });

  socket.on('start_game',()=>{
    const room=getRoomBySocket(socket.id);
    if(!room||room.players[0].socketId!==socket.id||room.phase!=='lobby')return;
    room.phase='playing';
    initGame(room);
    room.players.forEach((p,i)=>{if(room.game.players[i])room.game.players[i].socketId=p.socketId;});
    io.to(room.id).emit('game_started');
    broadcastState(room);
    if(room.game.players[room.game.currentPlayer].isBot)botPlay(room);
  });

  socket.on('play_card',({cardId,chosenColor})=>{
    const room=getRoomBySocket(socket.id);
    if(!room||room.phase!=='playing')return;
    const gi=room.game.players.findIndex(p=>p.socketId===socket.id);
    if(gi===-1)return;
    const result=processPlay(room,gi,cardId,chosenColor||null);
    if(result.error){socket.emit('error_msg',result.error);return;}
    if(result.needColor){socket.emit('pick_color');return;}
    if(result.winner!==undefined){endGame(room,result.winner);return;}
    broadcastState(room);
    if(room.phase==='playing'&&room.game.players[room.game.currentPlayer].isBot)botPlay(room);
  });

  socket.on('choose_color',({color})=>{
    const room=getRoomBySocket(socket.id);
    if(!room||room.phase!=='playing')return;
    const g=room.game;
    const gi=g.players.findIndex(p=>p.socketId===socket.id);
    if(!g.waitingForColor||g.pendingWildPlayer!==gi||!COLORS.includes(color))return;
    topCard(g).activeColor=color;g.waitingForColor=false;g.pendingWildPlayer=null;
    aLog(g,`${g.players[gi].name} choisit ${color.toUpperCase()} 🎨`);
    advance(g);
    broadcastState(room);
    if(room.phase==='playing'&&g.players[g.currentPlayer].isBot)botPlay(room);
  });

  socket.on('draw_card',()=>{
    const room=getRoomBySocket(socket.id);
    if(!room||room.phase!=='playing')return;
    const gi=room.game.players.findIndex(p=>p.socketId===socket.id);
    if(gi===-1)return;
    const result=processDrawOrPass(room,gi);
    if(result.error){socket.emit('error_msg',result.error);return;}
    if(result.drawnCard)socket.emit('drawn_card_playable',{card:result.drawnCard});
    broadcastState(room);
    if(room.phase==='playing'&&room.game.players[room.game.currentPlayer].isBot)botPlay(room);
  });

  socket.on('peek_result',({targetIdx})=>{
    const room=getRoomBySocket(socket.id);
    if(!room||!room.game)return;
    socket.emit('peek_data',{playerName:room.game.players[targetIdx].name,cards:room.game.hands[targetIdx]});
  });

  socket.on('disconnect',()=>{
    const room=getRoomBySocket(socket.id);
    if(!room)return;
    const p=room.players.find(p=>p.socketId===socket.id);
    if(p){p.connected=false;if(room.phase==='lobby')broadcastLobby(room);else if(room.game)broadcastState(room);}
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`🎂 UNO Mathis server on port ${PORT}`));
