class MyQueue {
    private int[] arr;
    private int front, rear, size, capacity;

    public MyQueue(int capacity) {
        this.capacity = capacity;
        arr = new int[capacity];
        front = 0;
        rear = -1;
        size = 0;
    }

    public boolean isFull() {
        return size == capacity;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public String enqueue(int value) {
        if (isFull()) return "FULL";

        rear = (rear + 1) % capacity;
        arr[rear] = value;
        size++;
        return "OK";
    }

    public String dequeue() {
        if (isEmpty()) return "EMPTY";

        front = (front + 1) % capacity;
        size--;
        return "OK";
    }

    public String getQueue() {
        if (isEmpty()) return "";

        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < size; i++) {
            sb.append(arr[(front + i) % capacity]);
            if (i != size - 1) {
                sb.append(",");
            }
        }

        return sb.toString();
    }
}

