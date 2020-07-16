importScripts('grid.js')
importScripts('tile.js')
importScripts('game.js')
importScripts('drone.js')

let drone = new Drone();

function makeMove(serializedGame, maxDepth) {
  let game = new Game();
  game.setup(serializedGame);
  bestMove = drone.maximin(game, maxDepth);
      
  // console.log(bestMove);
  // console.log('MaxDepth: ' + maxDepth);
  // console.log('Used Memo ' + maximinUsedMemo + ' times');
  // console.log('Did not use memo ' + maximinDidNotUseMemo + ' times');

  // console.log('Maximin Memo size: ' + Object.keys(drone.maximinMemo).length);
  if(Object.keys(drone.maximinMemo).length > 1e7){
    drone.maximinMemo = {};
  }

  // console.log('Minimax Memo size: ' + Object.keys(drone.minimaxMemo).length);
  if(Object.keys(drone.minimaxMemo).length > 1e7){
    drone.minimaxMemo = {};
  }

  if(bestMove.move == -1){
    bestMove = drone.maximin(game, 1);
  }

  postMessage(JSON.stringify({
    type:'MOVE',
    move: bestMove
  }));
}

onmessage = e => {
  let message = JSON.parse(e.data);
  // console.log('WORKER GOTEM', message);
  switch(message.type){
    case 'MAKE_MOVE':
      makeMove(message.game, message.maxDepth);
      break;
    default: console.log(`No handler for message of type "${message.type}"`)
  }
}

postMessage(JSON.stringify({
  type:'READY'
}));