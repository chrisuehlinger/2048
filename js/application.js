// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
<<<<<<< HEAD
  var ai = new AI();
  // var inputManager = new KeyboardInputManager();
  var actuator = new HTMLActuator();
  var manager = new GameManager(4, ai, actuator, LocalStorageManager);
  setTimeout(function(){ai.run(manager.game);}, 100);

=======
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);

  // TODO: This code is in need of a refactor (along with the rest)
  var storage     = new LocalStorageManager;
  var noticeClose = document.querySelector(".notice-close-button");
  var notice      = document.querySelector(".app-notice");
  if (storage.getNoticeClosed()) {
    notice.parentNode.removeChild(notice);
  } else {
    noticeClose.addEventListener("click", function () {
      notice.parentNode.removeChild(notice);
      storage.setNoticeClosed(true);
      ga("send", "event", "notice", "closed");
    });
  }
>>>>>>> 95be843b3f2cbe3ef6fbab7812e514384c2959a5
});
