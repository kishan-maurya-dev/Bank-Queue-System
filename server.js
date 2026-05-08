const express = require("express");
const path = require("path");

const app = express();
const PORT = 8000;

class CircularQueue {
    constructor(capacity, label) {
        this.capacity = capacity;
        this.label = label;
        this.items = new Array(capacity).fill(null);
        this.front = 0;
        this.rear = -1;
        this.size = 0;
    }

    isFull() {
        return this.size === this.capacity;
    }

    isEmpty() {
        return this.size === 0;
    }

    enqueue(customer) {
        if (this.isFull()) return false;

        this.rear = (this.rear + 1) % this.capacity;
        this.items[this.rear] = customer;
        this.size++;
        return true;
    }

    dequeue() {
        if (this.isEmpty()) return null;

        const customer = this.items[this.front];
        this.items[this.front] = null;
        this.front = (this.front + 1) % this.capacity;
        this.size--;

        if (this.isEmpty()) {
            this.front = 0;
            this.rear = -1;
        }

        return customer;
    }

    peek() {
        return this.isEmpty() ? null : this.items[this.front];
    }

    toArray() {
        const result = [];

        for (let index = 0; index < this.size; index++) {
            result.push(this.items[(this.front + index) % this.capacity]);
        }

        return result;
    }

    snapshot() {
        return {
            label: this.label,
            capacity: this.capacity,
            size: this.size,
            front: this.isEmpty() ? -1 : this.front,
            rear: this.rear,
            isFull: this.isFull(),
            isEmpty: this.isEmpty(),
            items: this.items,
            ordered: this.toArray()
        };
    }
}

class BankQueueSystem {
    constructor() {
        this.isOpen = true;
        this.configure(8, 3);
    }

    configure(capacity, counters) {
        const safeCapacity = clampNumber(capacity, 1, 30, 8);
        const safeCounters = clampNumber(counters, 1, 6, 3);

        this.normalQueue = new CircularQueue(safeCapacity, "Regular Queue");
        this.priorityQueue = new CircularQueue(Math.max(1, Math.ceil(safeCapacity / 2)), "Priority Queue");
        this.counters = Array.from({ length: safeCounters }, (_, index) => ({
            id: index + 1,
            current: null,
            served: 0
        }));
        this.nextToken = 101;
        this.totalArrivals = 0;
        this.totalServed = 0;
        this.rejected = 0;
        this.totalWaitTime = 0;
        this.lastServed = null;
        this.events = [];
        this.log(`System configured with capacity ${safeCapacity} and ${safeCounters} counters.`);
        return this.state();
    }

    addCustomer(name, priority) {
        if (!this.isOpen) return { ok: false, message: "Bank window is closed.", state: this.state() };

        const customer = {
            token: this.nextToken++,
            name: sanitizeName(name) || `Customer ${this.nextToken - 1}`,
            priority: priority === "priority" ? "priority" : "regular",
            arrivalOrder: this.totalArrivals + 1,
            enteredAt: Date.now()
        };
        const selectedQueue = customer.priority === "priority" ? this.priorityQueue : this.normalQueue;

        if (!selectedQueue.enqueue(customer)) {
            this.rejected++;
            this.log(`Token ${customer.token} rejected because ${selectedQueue.label} is full.`);
            return { ok: false, message: `${selectedQueue.label} is full.`, state: this.state() };
        }

        this.totalArrivals++;
        this.log(`Token ${customer.token} joined the ${selectedQueue.label}.`);
        return { ok: true, message: `Token ${customer.token} added.`, state: this.state() };
    }

    serveNext(counterId) {
        if (!this.isOpen) return { ok: false, message: "Bank window is closed.", state: this.state() };

        const counter = this.counters.find((item) => item.id === Number(counterId)) || this.counters[0];
        const customer = this.priorityQueue.dequeue() || this.normalQueue.dequeue();

        if (!customer) {
            this.lastServed = null;
            this.log(`Counter ${counter.id} tried to serve, but both queues were empty.`);
            return { ok: false, message: "Both queues are empty.", state: this.state() };
        }

        const waitedSeconds = Math.max(0, Math.round((Date.now() - customer.enteredAt) / 1000));
        customer.waitedSeconds = waitedSeconds;
        counter.current = customer;
        counter.served++;
        this.totalServed++;
        this.totalWaitTime += waitedSeconds;
        this.lastServed = { ...customer, counterId: counter.id };
        this.log(`Counter ${counter.id} served token ${customer.token} after ${waitedSeconds}s.`);

        return { ok: true, message: `Counter ${counter.id} served token ${customer.token}.`, state: this.state() };
    }

    close() {
        this.isOpen = false;
        this.log("Bank window closed.");
        return this.state();
    }

    open() {
        this.isOpen = true;
        this.log("Bank window opened.");
        return this.state();
    }

    reset() {
        const capacity = this.normalQueue.capacity;
        const counters = this.counters.length;
        this.isOpen = true;
        return this.configure(capacity, counters);
    }

    clearCounters() {
        this.counters.forEach((counter) => {
            counter.current = null;
        });
        this.lastServed = null;
        this.log("Counter display cleared.");
        return this.state();
    }

    log(message) {
        this.events.unshift({
            time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
            message
        });
        this.events = this.events.slice(0, 10);
    }

    state() {
        const waiting = this.normalQueue.size + this.priorityQueue.size;
        const averageWait = this.totalServed === 0 ? 0 : Math.round(this.totalWaitTime / this.totalServed);

        return {
            isOpen: this.isOpen,
            queues: {
                regular: this.normalQueue.snapshot(),
                priority: this.priorityQueue.snapshot()
            },
            counters: this.counters,
            stats: {
                waiting,
                totalArrivals: this.totalArrivals,
                totalServed: this.totalServed,
                rejected: this.rejected,
                averageWait,
                utilization: this.normalQueue.capacity === 0
                    ? 0
                    : Math.round((this.normalQueue.size / this.normalQueue.capacity) * 100)
            },
            lastServed: this.lastServed,
            events: this.events
        };
    }
}

function clampNumber(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function sanitizeName(value) {
    return String(value || "").trim().replace(/[<>]/g, "").slice(0, 32);
}

const bank = new BankQueueSystem();

app.use(express.static(__dirname));

app.get("/api/state", (req, res) => {
    res.json(bank.state());
});

app.get("/api/configure", (req, res) => {
    res.json({ ok: true, message: "Queue configured.", state: bank.configure(req.query.capacity, req.query.counters) });
});

app.get("/api/customer", (req, res) => {
    res.json(bank.addCustomer(req.query.name, req.query.priority));
});

app.get("/api/serve", (req, res) => {
    res.json(bank.serveNext(req.query.counter));
});

app.get("/api/open", (req, res) => {
    res.json({ ok: true, message: "Bank opened.", state: bank.open() });
});

app.get("/api/close", (req, res) => {
    res.json({ ok: true, message: "Bank closed.", state: bank.close() });
});

app.get("/api/reset", (req, res) => {
    res.json({ ok: true, message: "System reset.", state: bank.reset() });
});

app.get("/api/clear-counters", (req, res) => {
    res.json({ ok: true, message: "Counter display cleared.", state: bank.clearCounters() });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Queue server running at http://localhost:${PORT}`);
    });
}

module.exports = {
    app,
    bank,
    BankQueueSystem,
    CircularQueue
};
