const express = require("express");
const app = express();
const PORT = 8000;

let queue = null;
let windowClosed = false;

class MyQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.arr = new Array(capacity);
        this.front = 0;
        this.rear = -1;
        this.size = 0;
    }

    isFull() { return this.size === this.capacity; }
    isEmpty() { return this.size === 0; }

    enqueue(value) {
        if(this.isFull()) return "FULL";
        this.rear = (this.rear + 1) % this.capacity;
        this.arr[this.rear] = value;
        this.size++;
        return "OK";
    }

    dequeue() {
        if(this.isEmpty()) return "EMPTY";
        const val = this.arr[this.front];
        this.front = (this.front + 1) % this.capacity;
        this.size--;
        return val;
    }

    getQueue() {
        if(this.isEmpty()) return "";
        let result = [];
        for(let i=0; i<this.size; i++) {
            result.push(this.arr[(this.front + i) % this.capacity]);
        }
        return result.join(",");
    }
}

                                                                // Enable CORS
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

                                                                 // CREATE QUEUE
app.get("/create", (req,res) => {
    if(windowClosed) return res.send("CLOSED|");
    const size = parseInt(req.query.size);
    queue = new MyQueue(size);
    res.send("OK|" + queue.getQueue());
});

                                                                   // ENQUEUE
app.get("/enqueue", (req,res) => {
    if(windowClosed) return res.send("CLOSED|");
    if(!queue) return res.send("NO_QUEUE|");

    const value = req.query.value;
    const result = queue.enqueue(value);

    res.send(result + "|" + queue.getQueue());
});

                                                                     // DEQUEUE
app.get("/dequeue", (req,res) => {
    if(windowClosed) return res.send("CLOSED|");
    if(!queue) return res.send("NO_QUEUE|");

    const val = queue.dequeue();
    if(val === "EMPTY") {
        res.send("EMPTY|" + queue.getQueue());
    } else {
        res.send(val + "|" + queue.getQueue());
    }
});

                                                                   // TOGGLE OPEN/CLOSE
app.get("/toggle", (req,res) => {
    windowClosed = !windowClosed;
    if(windowClosed) {
        queue = null;
        res.send("CLOSED|");
    } else {
        res.send("OPEN|");
    }
});

app.listen(PORT, () => console.log(`✅ QueueServer running at http://localhost:${PORT}`));
