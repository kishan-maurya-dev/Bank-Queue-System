# Bank Queue Simulator

An advanced DSA project that demonstrates queue operations through a real-world bank service counter simulation.

## Features

- Circular array queue with visible front and rear indexes
- Priority queue for urgent customers
- Multiple service counters
- Overflow and underflow handling
- Live statistics for waiting, arrivals, served customers, rejected customers, and average wait time
- Event log for explaining operations during viva or presentation
- Java implementation in `MyQueue.java`
- Node.js tests for core queue behavior

## DSA Concepts

- Queue
- Circular Queue
- Priority Queue behavior
- FIFO ordering
- Overflow and underflow
- Time complexity analysis

## Complexity

| Operation | Time | Space |
| --- | --- | --- |
| Enqueue | O(1) | O(1) |
| Dequeue | O(1) | O(1) |
| Peek | O(1) | O(1) |
| Display queue | O(n) | O(n) |

## Run

```bash
npm start
```

Open:

```text
http://localhost:8000
```

## Test

```bash
npm test
```
