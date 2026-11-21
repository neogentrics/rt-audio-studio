// Runs in the audio thread: gathers the microphone's sound into interleaved pieces of about 0.2 seconds, and sends
// each one on. It does no processing of its own.
class Collector extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.channels = options.processorOptions.channels;
    this.limit = Math.round(sampleRate * 0.2);
    this.buffer = new Float32Array(this.limit * this.channels);
    this.frames = 0;
  }

  process(inputs) {
    const input = inputs[0] || [];
    const n = input[0] ? input[0].length : 128;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < this.channels; c++) this.buffer[this.frames * this.channels + c] = input[c] ? input[c][i] : 0;
      this.frames++;
      if (this.frames === this.limit) {
        const out = this.buffer;
        this.port.postMessage(out, [out.buffer]);
        this.buffer = new Float32Array(this.limit * this.channels);
        this.frames = 0;
      }
    }
    return true;
  }
}
registerProcessor('collector', Collector);
