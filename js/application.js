// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var ai = new AI();
  // var inputManager = new KeyboardInputManager();
  var actuator = new HTMLActuator();
  var manager = new GameManager(4, ai, actuator, LocalStorageManager);
  //setTimeout(function(){ai.run(manager.game);}, 100);
});
