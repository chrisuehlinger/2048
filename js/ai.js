function AI(){
	this.direction = 0;
  this.events = {};
};

AI.prototype = {

  // New stuff
  on: function(event, callback){
    this.events[event] = callback;
  },

  dispatch: async function(attempt, maxDepth) {
    let bestMovePromise = this.liaisons[this.nextLiaison].planMove(attempt.serialize(), maxDepth);
    this.nextLiaison = (this.nextLiaison + 1) % this.liaisons.length
    return await bestMovePromise;
  },

  minimax: async function(game, depth){
    if(!game.movesAvailable()){
      return {'newTile': new Tile({x:-1, y:-1}, -1), 'score': 0};
    }else if(depth <= 0){
      return {'newTile': new Tile({x:-1, y:-1}, -1), 'score': this.staticScore(game)}
    }else{
      var serializedGame = game.serialize();
      var key = JSON.stringify(serializedGame);
      var emptyTiles = game.grid.availableCells();

      var attemptScorePromises = [];

      for(var j = 0; j < emptyTiles.length; j++){
        for(var k = 2; k <= 4; k += 2){
          var attempt = new Game();
          attempt.setup(serializedGame);

          var newTile = new Tile(emptyTiles[j], k);
          attempt.grid.insertTile(newTile);
          attemptScorePromises.push(this.dispatch(attempt, depth-1));
        }
      }

      let attemptScores = (await Promise.all(attemptScorePromises));

      var avgAttemptScores = 0;
      var lossFactor = 100, losses = 0;
      var totalScore = 0;
      for(j = 0; j < attemptScores.length; j++){
        if(attemptScores[j].score === -Infinity){
          losses++;
        }else {
          avgAttemptScores += attemptScores[j].score;
        }
      }

      if(attemptScores.length - losses > 0){
        avgAttemptScores /= (attemptScores.length - losses);
        totalScore += avgAttemptScores;
      }

      totalScore -= losses*lossFactor;

      return {'score':totalScore};
    }
  },

  maximinMemo: {},

  maximin: async function(game, depth){
    if(!game.movesAvailable()){
      return {'move': -1, 'score': 0};
    }else{
      var serializedGame = game.serialize();
      var key = JSON.stringify(serializedGame);
      var attemptScorePromises = [];

      for(var i = 0; i < 3; i++){
        var attempt = new Game();
        attempt.setup(serializedGame);
        if(attempt.testMove(i, true)){
          attemptScorePromises.push({'move': i, 'score': this.minimax(attempt, depth-1)})
        }
      }
      let attemptScores = (await Promise.all(attemptScorePromises.map(async attempt => ({move: attempt.move, score: (await attempt.score).score}))));

      var bestMove = {'move': -1, 'score': -Infinity};
      for(i = 0; i < attemptScores.length; i++){
        if(attemptScores[i].score > bestMove.score){
          bestMove = attemptScores[i];
        }
      }
      return bestMove;
    }
  },

  planMove: async function(){
    if(!this.currentGame.over){
      var branchingFactor = this.currentGame.grid.availableCells().length;
      var maxDepth = 0;
      if(branchingFactor <= 2){
        maxDepth = 12;
      }else if(branchingFactor <= 4){
        maxDepth = 10;
      }else if(branchingFactor <= 6){
        maxDepth = 8;
      }else if(branchingFactor <= 8){
        maxDepth = 8;
      }else{
        maxDepth = 6;
      }

      let bestMove = await this.maximin(this.currentGame, maxDepth);
      console.log('BEST MOVE', bestMove);
      this.events['move'](bestMove.move);
      setTimeout(() => requestAnimationFrame(this.planMove.bind(this)), 0);
    }
  },

  isReady: function(){
    this.readyWorkers++;
    if(this.readyWorkers === this.liaisons.length){
      this.planMove();
    }
  },

  setupLiaisons: function (numLiaisons=6){
    this.liaisons = [];
    this.nextLiaison = 0;
    this.readyWorkers = 0;
    for(let i=0; i<numLiaisons; i++){
      this.liaisons.push(new Liaison(this));
    }
  },

  run: function(game){
    this.events['restart']();
    this.currentGame = game;
    this.drone = new Drone();
    this.setupLiaisons();
  }
};