const net = require('net');

class SawitDB {
  constructor(url, dbName, options = {}) {
    const match = url.match(/sawitdb:\/\/([^:]+):(\d+)/);
    if (!match) throw new Error('Invalid SawitDB URL format');
    
    this.host = match[1];
    this.port = parseInt(match[2]);
    this.dbName = dbName;
    this.socket = null;
    this.buffer = '';
    this.requestId = 0;
    this.data = {};
    this.connection = null;
    this.options = options;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({ 
        host: this.host, 
        port: this.port 
      });

      this.socket.on('connect', () => {
        this.socket.once('data', async () => {
          try {
            await this.query(`BUKA WILAYAH ${this.dbName}`);
            await this.query(`MASUK WILAYAH ${this.dbName}`);
            this.connection = { readyState: 1 };
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      this.socket.on('error', reject);
    });
  }

  query(sql, params = null) {
    return new Promise((resolve, reject) => {
      const reqId = ++this.requestId;
      const timeout = setTimeout(() => {
        reject(new Error('Query timeout'));
      }, 10000);

      const handler = (chunk) => {
        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          try {
            const response = JSON.parse(line);
            if (response.type === 'error') {
              clearTimeout(timeout);
              this.socket.off('data', handler);
              reject(new Error(response.error));
              return;
            }
            clearTimeout(timeout);
            this.socket.off('data', handler);
            resolve(response);
            return;
          } catch (e) {
            continue;
          }
        }
      };

      this.socket.on('data', handler);

      const payload = {
        type: 'query',
        payload: {
          query: sql,
          params: params
        },
        id: reqId
      };

      this.socket.write(JSON.stringify(payload) + '\n');
    });
  }

  async read() {
    try {
      await this.connect();
      
      const tableExists = await this.query('LIHAT LAHAN');
      const tables = tableExists.result || '';
      
      if (!tables.includes('botdata')) {
        await this.query('LAHAN botdata');
        await this.query("TANAM KE botdata (id, data) BIBIT (1, '{}')");
      }
      
      const result = await this.query('PANEN * DARI botdata DIMANA id = 1');
      
      if (result.result && result.result.length > 0) {
        const dataStr = result.result[0].data || '{}';
        this.data = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
      } else {
        this.data = {};
      }
      
      return this.data;
    } catch (error) {
      console.error('Error reading from SawitDB:', error);
      this.data = {};
      return this.data;
    }
  }

  async write(data) {
    if (!data) return data;
    
    try {
      const dataStr = JSON.stringify(data);
      const escapedData = dataStr.replace(/'/g, "''");
      
      const checkResult = await this.query('PANEN * DARI botdata DIMANA id = 1');
      
      if (checkResult.result && checkResult.result.length > 0) {
        await this.query(`PUPUK botdata DENGAN data='${escapedData}' DIMANA id = 1`);
      } else {
        await this.query(`TANAM KE botdata (id, data) BIBIT (1, '${escapedData}')`);
      }
      
      this.data = data;
      return data;
    } catch (error) {
      console.error('Error writing to SawitDB:', error);
      return null;
    }
  }

  async disconnect() {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.connection = null;
    }
  }
}

module.exports = SawitDB;
