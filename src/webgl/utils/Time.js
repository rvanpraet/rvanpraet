import { EventEmitter } from 'events';
import { Timer } from 'three';

export default class Time extends EventEmitter {

  static instance;

  constructor() {
    super();

    this.timer = new Timer()
    this.timer.connect(document)

    this.update();
  }

  static getInstance() {
    if (!Time.instance) {
      Time.instance = new Time();
    }

    return Time.instance;
  }

  update(timestamp) {
    this.timer.update(timestamp)
    const delta = this.timer.getDelta()
    const time = this.timer.getElapsed()

    this.emit('update', time, delta,);

    this.requestAnimtionFrameId = window.requestAnimationFrame((t) => this.update(t));
  }

  dispose() {
    cancelAnimationFrame(this.requestAnimtionFrameId);
    this.timer.dispose()
  }
}
