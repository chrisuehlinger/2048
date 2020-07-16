async function delay(time){
  return await new Promise(resolve => setTimeout(resolve, time));
}

function Liaison(delegate){
  this.isBusy = false;
  this.worker = new Worker('js/worker.js');
  this.worker.onmessage = this.receiveMessage.bind(this);
  this.delegate = delegate;
}

Liaison.prototype = {

  planMove: async function (game, maxDepth){
    while(this.isBusy) {
      await delay(10);
    }
    this.isBusy = true;
    return await new Promise(resolve => {
      this.resolve = resolve;
      this.worker.postMessage(JSON.stringify({
        type: 'MAKE_MOVE',
        game,
        maxDepth
      }));
    });
  },

  receiveMessage: function(e){
    let message = JSON.parse(e.data);
    // console.log('GOTEM', message);
    switch(message.type){
      case 'READY':
        this.delegate.isReady();
        break;
      case 'MOVE':
        this.isBusy = false;
        this.resolve(message.move);
        break;
      default: console.log(`No handler for message of type "${message.type}"`)
    }
  },
}