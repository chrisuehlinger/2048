function GameManager(size, inputManager, actuator, StorageManager) {
  this.game           = new Game(size);
  this.inputManager   = inputManager;
  this.storageManager = new StorageManager;
  this.actuator       = actuator;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.game.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();
  this.game.setup(previousState);

  // Update the actuator
  this.actuate();

};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.game.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.game.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.game.serialize());
  }

  this.actuator.actuate(this.game.grid, {
    score:      this.game.score,
    over:       this.game.over,
    won:        this.game.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.game.isGameTerminated()
  });

};



GameManager.prototype.move = function(direction){
  var moved = this.game.move(direction);
  if(moved){
    this.actuate();
  }
};
