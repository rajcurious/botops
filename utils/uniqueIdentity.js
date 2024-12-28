class UniqueIDGenerator {
    constructor(dev = false) {
      this.lastTimestamp = 0;
      this.sequence = 0;
      this.serverId = 0;
      this.maxSequence = 8191; // 13 bits: supports 8192 messages per millisecond
      this.dev =  dev
    }
  
    generateID() {
      const currentTimestamp = Date.now(); // Get current timestamp in milliseconds
  
      if (currentTimestamp === this.lastTimestamp) {
        // Increment sequence if within the same millisecond
        this.sequence += 1;
        if (this.sequence > this.maxSequence) {
          // Wait for the next millisecond if sequence exceeds max
          while (Date.now() <= this.lastTimestamp);
          this.sequence = 0;
        }
      } else {
        // Reset sequence for a new millisecond
        this.sequence = 0;
      }
  
      this.lastTimestamp = currentTimestamp;
      
      return currentTimestamp
      
      // const id = (BigInt(currentTimestamp) << 22n) | // Timestamp (41 bits)
      // (BigInt(this.serverId) << 13n) | // Server ID (9 bits)
      //  BigInt(this.sequence); // Sequence (13 bits)

      // return id;
    }
  }

module.exports =   UniqueIDGenerator;
  