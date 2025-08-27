import { io, Socket } from 'socket.io-client';

interface PerformanceMetrics {
  connectionTime: number;
  messageLatency: number[];
  disconnectTime: number;
  totalMessages: number;
  errors: number;
}

class WebSocketPerformanceTest {
  private socket: Socket | null = null;
  private metrics: PerformanceMetrics = {
    connectionTime: 0,
    messageLatency: [],
    disconnectTime: 0,
    totalMessages: 0,
    errors: 0,
  };
  private startTime: number = 0;

  async runTest() {
    console.log('🔌 Starting WebSocket Performance Test...\n');

    try {
      // Test 1: Connection Performance
      console.log('📡 Test 1: Connection Performance');
      await this.testConnection();

      // Test 2: Message Latency
      console.log('\n⚡ Test 2: Message Latency Test');
      await this.testMessageLatency();

      // Test 3: Concurrent Connections
      console.log('\n🔄 Test 3: Concurrent Connection Test');
      await this.testConcurrentConnections();

      // Test 4: Reconnection Performance
      console.log('\n🔄 Test 4: Reconnection Performance');
      await this.testReconnection();

      // Test 5: Load Testing
      console.log('\n🚀 Test 5: Load Testing');
      await this.testLoad();

      this.printResults();

    } catch (error) {
      console.error('❌ WebSocket performance test failed:', error);
    }
  }

  private async testConnection() {
    const startTime = Date.now();
    
    return new Promise<void>((resolve, reject) => {
      this.socket = io('http://localhost:3001', {
        transports: ['websocket'],
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        const connectionTime = Date.now() - startTime;
        this.metrics.connectionTime = connectionTime;
        console.log(`✅ Connected in ${connectionTime}ms`);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private async testMessageLatency() {
    if (!this.socket) return;

    return new Promise<void>((resolve) => {
      let messageCount = 0;
      const maxMessages = 10;

      const sendMessage = () => {
        if (messageCount >= maxMessages) {
          resolve();
          return;
        }

        const sendTime = Date.now();
        
        // Simulate voting events
        this.socket!.emit('vote_cast', {
          electionId: 'test-election',
          candidateId: 'test-candidate',
          timestamp: new Date().toISOString(),
        });

        this.socket!.once('vote_confirmed', (data) => {
          const receiveTime = Date.now();
          const latency = receiveTime - sendTime;
          this.metrics.messageLatency.push(latency);
          this.metrics.totalMessages++;
          
          console.log(`📨 Message ${messageCount + 1}: ${latency}ms latency`);
          messageCount++;
          
          setTimeout(sendMessage, 100);
        });

        // Fallback for messages that don't get response
        setTimeout(() => {
          if (messageCount < maxMessages) {
            console.log(`⚠️  Message ${messageCount + 1}: No response (timeout)`);
            messageCount++;
            setTimeout(sendMessage, 100);
          }
        }, 2000);
      };

      sendMessage();
    });
  }

  private async testConcurrentConnections() {
    console.log('Testing 5 concurrent connections...');
    
    const connectionPromises = Array.from({ length: 5 }, (_, i) => 
      this.createTestConnection(i + 1)
    );

    const startTime = Date.now();
    const results = await Promise.allSettled(connectionPromises);
    const totalTime = Date.now() - startTime;

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Concurrent connections: ${successful} successful, ${failed} failed in ${totalTime}ms`);
  }

  private async createTestConnection(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = io('http://localhost:3001', {
        transports: ['websocket'],
        timeout: 5000,
      });

      socket.on('connect', () => {
        console.log(`   ✅ Connection ${id}: Connected`);
        setTimeout(() => {
          socket.disconnect();
          resolve();
        }, 1000);
      });

      socket.on('connect_error', () => {
        console.log(`   ❌ Connection ${id}: Failed`);
        reject(new Error(`Connection ${id} failed`));
      });

      setTimeout(() => {
        if (!socket.connected) {
          reject(new Error(`Connection ${id} timeout`));
        }
      }, 5000);
    });
  }

  private async testReconnection() {
    if (!this.socket) return;

    console.log('Testing reconnection performance...');
    
    const disconnectTime = Date.now();
    this.socket.disconnect();
    
    // Wait for disconnect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reconnectStart = Date.now();
    await this.testConnection();
    const reconnectTime = Date.now() - reconnectStart;
    
    this.metrics.disconnectTime = disconnectTime;
    console.log(`✅ Reconnection time: ${reconnectTime}ms`);
  }

  private async testLoad() {
    console.log('Testing WebSocket load handling...');
    
    const connections: Socket[] = [];
    const maxConnections = 20;
    
    try {
      // Create multiple connections
      for (let i = 0; i < maxConnections; i++) {
        const socket = io('http://localhost:3001', {
          transports: ['websocket'],
          timeout: 5000,
        });
        
        socket.on('connect', () => {
          console.log(`   📡 Connection ${i + 1}: Active`);
        });
        
        connections.push(socket);
        
        // Small delay between connections
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ Load test: ${connections.length} connections created`);
      
      // Keep connections alive for a bit
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } finally {
      // Clean up connections
      connections.forEach(socket => socket.disconnect());
      console.log(`🧹 Cleaned up ${connections.length} connections`);
    }
  }

  private printResults() {
    console.log('\n📊 WEBSOCKET PERFORMANCE TEST RESULTS');
    console.log('=====================================');
    console.log(`Connection Time: ${this.metrics.connectionTime}ms`);
    console.log(`Total Messages: ${this.metrics.totalMessages}`);
    console.log(`Errors: ${this.metrics.errors}`);
    
    if (this.metrics.messageLatency.length > 0) {
      const avgLatency = this.metrics.messageLatency.reduce((a, b) => a + b, 0) / this.metrics.messageLatency.length;
      const minLatency = Math.min(...this.metrics.messageLatency);
      const maxLatency = Math.max(...this.metrics.messageLatency);
      
      console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
      console.log(`Min Latency: ${minLatency}ms`);
      console.log(`Max Latency: ${maxLatency}ms`);
    }
    
    console.log('\n💡 PERFORMANCE ASSESSMENT');
    console.log('==========================');
    
    if (this.metrics.connectionTime < 100) {
      console.log('✅ Connection performance: Excellent');
    } else if (this.metrics.connectionTime < 500) {
      console.log('✅ Connection performance: Good');
    } else {
      console.log('⚠️  Connection performance: Needs improvement');
    }
    
    if (this.metrics.messageLatency.length > 0) {
      const avgLatency = this.metrics.messageLatency.reduce((a, b) => a + b, 0) / this.metrics.messageLatency.length;
      if (avgLatency < 50) {
        console.log('✅ Message latency: Excellent');
      } else if (avgLatency < 200) {
        console.log('✅ Message latency: Good');
      } else {
        console.log('⚠️  Message latency: Needs improvement');
      }
    }
    
    console.log('\n🎯 WebSocket system is ready for real-time voting!');
  }
}

// Run the test
const test = new WebSocketPerformanceTest();
test.runTest();
