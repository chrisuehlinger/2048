function AI(){
	this.direction = 0;
  this.events = {};
};

var MAX_DEPTH = 4;
var maximinUsedMemo = 0;
var maximinDidNotUseMemo = 0;

AI.prototype = {
  // Old Ways of Playing
  playClockWise: function(){
    console.log("Hey");
    this.events['move'](this.direction);
    this.direction = (this.direction + 1) % 4;
  },

  playCounterClockWise: function(){
    this.events['move'](this.direction)
    this.direction -= 1;
    if(this.direction < 0){
      this.direction = 3
    }
  },

  // New stuff
  on: function(event, callback){
    this.events[event] = callback;
  },

  staticScoreMemo: {},

  staticScore: function(game){
    if(game.won){
      return Infinity;
    } else if(game.over){
      return -Infinity;
    }else {
      // var serializedGrid = JSON.stringify(game.grid.serialize());
      // if(this.staticScoreMemo[serializedGrid]){
      //   console.log("Static Score Memo!");
      //   return this.staticScoreMemo[serializedGrid];
      // } else {

        var scoreWeight = 0.5;
        var spaceWeight = 5;

        var cellsUsed = (game.size*game.size - game.grid.cellsAvailable());
        // this.staticScoreMemo[serializedGrid] = scoreWeight*game.score - spaceWeight*cellsUsed;

        return scoreWeight*game.score - spaceWeight*cellsUsed;
      // }
    }

  },

  minimaxMemo: {},

  minimax: function(game, depth){
    if(game.won){
      return {'newTile': new Tile({x:-1, y:-1}, -1), 'score': Infinity};
    } else if(!game.movesAvailable()){
      return {'newTile': new Tile({x:-1, y:-1}, -1), 'score': -Infinity};
    }else if(depth <= 0){
      return {'newTile': new Tile({x:-1, y:-1}, -1), 'score': this.staticScore(game)}
    }else{
      var serializedGame = game.serialize();
      var key = JSON.stringify(serializedGame);

      if(this.minimaxMemo[key] && this.minimaxMemo[key]['depth'] >= depth){
        maximinUsedMemo++;
        return this.minimaxMemo[key]['result'];
      }else{
        var emptyTiles = game.grid.availableCells();

        var attemptScores = [];

        for(var j = 0; j < emptyTiles.length; j++){
          for(var k = 2; k <= 4; k += 2){
            var attempt = new Game();
            attempt.setup(serializedGame);

            var newTile = new Tile(emptyTiles[j], k);
            attempt.grid.insertTile(newTile);
            attemptScores.push({'newTile':newTile, 
                                'score':this.maximin(attempt, depth-1).score});
          }
        }

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

        this.minimaxMemo[key] = {'depth':depth, 'result':{'score':totalScore}};

        return {'score':totalScore};
      }
    }

  },

  maximinMemo: {},

  maximin: function(game, depth){
    if(game.won){
      return {'move': -1, 'score': Infinity};
    } else if(!game.movesAvailable()){
      return {'move': -1, 'score': -Infinity};
    }else if(depth <= 0){
      return {'move': -1, 'score': this.staticScore(game)}
    }else{
        var serializedGame = game.serialize();
        var key = JSON.stringify(serializedGame);

        if(this.maximinMemo[key] && this.maximinMemo[key]['depth'] >= depth){
          maximinUsedMemo++;
          return this.maximinMemo[key]['bestMove']
        }else{
          maximinDidNotUseMemo++;
        var attemptScores = [];

        for(var i = 0; i < 3; i++){
          var attempt = new Game();
          attempt.setup(serializedGame);
          if(attempt.testMove(i, true)){
            attemptScores.push({'move': i, 'score': this.minimax(attempt, depth-1).score})
          }
        }

        var bestMove = {'move': -1, 'score': -Infinity};
        for(i = 0; i < attemptScores.length; i++){
          if(attemptScores[i].score > bestMove.score){
            bestMove = attemptScores[i];
          }
        }
        this.maximinMemo[key] = {'depth': depth, 'bestMove':bestMove};
        return bestMove;
      }
    }
  },

  makeMove: function(){
    if(!this.currentGame.over){
      var branchingFactor = this.currentGame.grid.availableCells().length;
      var maxDepth = 0;
      if(branchingFactor <= 2){
        maxDepth = 10;
      }else if(branchingFactor <= 4){
        maxDepth = 8;
      }else if(branchingFactor <= 6){
        maxDepth = 6;
      }else if(branchingFactor <= 8){
        maxDepth = 4;
      }else{
        maxDepth = 2;
      }

      bestMove = this.maximin(this.currentGame, maxDepth);
      
      console.log(bestMove);
      console.log('MaxDepth: ' + maxDepth);
      console.log('Used Memo ' + maximinUsedMemo + ' times');
      console.log('Did not use memo ' + maximinDidNotUseMemo + ' times');

      if(bestMove.move == -1){
        bestMove = this.maximin(this.currentGame, 1);
      }
      this.events['move'](bestMove.move);

      setTimeout(this.makeMove.bind(this), 100);
    }
  },

  run: function(game){
    this.events['restart']();
    this.currentGame = game;
    this.makeMove();
  }
};