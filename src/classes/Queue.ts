import logger from '../logger';

export default class Queue<T> {
  elements: T[];
  currentlyProcessing: number;
  maxConcurrentProcess: number;
  processFunction: (data: T) => Promise<boolean>;
  constructor(params: {
    processFunction: (data: T) => Promise<boolean>;
    maxConcurrentProcess: number;
  }) {
    this.elements = [];
    this.maxConcurrentProcess = params.maxConcurrentProcess;
    this.currentlyProcessing = 0;
    this.processFunction = params.processFunction;
  }

  // Getter
  get length() {
    return this.elements.length;
  }

  enqueue(data: T[] | T) {
    if (Array.isArray(data)) {
      data.forEach((row) => {
        this.elements.push(row);
      });
    } else {
      this.elements.push(data);
    }
    this.process();
  }

  dequeue() {
    const firstElement = this.elements[0];
    this.elements = this.elements.slice(1);
    return firstElement;
  }

  process() {
    if (
      this.elements.length > 0 &&
      this.currentlyProcessing < this.maxConcurrentProcess
    ) {
      const nextData = this.dequeue();
      this.currentlyProcessing++;
      logger.info(
        `Processing next queue. Left in Queue: ${this.elements.length}, Currently Processing: ${this.currentlyProcessing}`,
      );
      this.processFunction(nextData)
        .catch((error) => {
          console.trace(error);
        })
        .finally(() => {
          this.currentlyProcessing--;
          this.process();
        });
      this.process();
    }
  }
}
