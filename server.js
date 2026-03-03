const express = require('express');
const os = require('os');
const client = require('prom-client');
const path = require('path');

const app = express();
const PORT = 5000;

// Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP Requests'
});

// Middleware
app.use((req, res, next) => {
    httpRequestCounter.inc();
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    const systemData = {
        hostname: os.hostname(),
        platform: os.platform(),
        uptime: os.uptime(),
        totalMemory: (os.totalmem() / 1024 / 1024).toFixed(2) + " MB",
        freeMemory: (os.freemem() / 1024 / 1024).toFixed(2) + " MB",
        cpuCount: os.cpus().length,
        version: "1.0.0"
    };

    res.json({
        message: "🚀 DevOps Health Dashboard",
        system: systemData
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: "UP" });
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.listen(PORT, () => {
    console.log(`🔥 App running on http://localhost:${PORT}`);
});