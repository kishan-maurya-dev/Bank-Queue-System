class Customer {
    int token;
    String name;

    Customer(int token, String name) {
        this.token = token;
        this.name = name;
    }

    public String toString() {
        return "#" + token + " " + name;
    }
}

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

        if (isEmpty()) {
            front = 0;
            rear = -1;
        }
        return "OK";
    }

    public String peek() {
        if (isEmpty()) return "EMPTY";
        return String.valueOf(arr[front]);
    }

    public int getFrontIndex() {
        return isEmpty() ? -1 : front;
    }

    public int getRearIndex() {
        return rear;
    }

    public int getSize() {
        return size;
    }

    public int getCapacity() {
        return capacity;
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

class CustomerQueue {
    private Customer[] arr;
    private int front, rear, size, capacity;

    CustomerQueue(int capacity) {
        this.capacity = capacity;
        this.arr = new Customer[capacity];
        this.front = 0;
        this.rear = -1;
        this.size = 0;
    }

    boolean isFull() {
        return size == capacity;
    }

    boolean isEmpty() {
        return size == 0;
    }

    String enqueue(Customer customer) {
        if (isFull()) return "FULL";

        rear = (rear + 1) % capacity;
        arr[rear] = customer;
        size++;
        return "OK";
    }

    Customer dequeue() {
        if (isEmpty()) return null;

        Customer customer = arr[front];
        arr[front] = null;
        front = (front + 1) % capacity;
        size--;

        if (isEmpty()) {
            front = 0;
            rear = -1;
        }

        return customer;
    }

    String snapshot() {
        if (isEmpty()) return "EMPTY";

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < size; i++) {
            sb.append(arr[(front + i) % capacity]);
            if (i != size - 1) sb.append(" <- ");
        }
        return sb.toString();
    }
}

class BankQueueDemo {
    public static void main(String[] args) {
        CustomerQueue regular = new CustomerQueue(5);
        CustomerQueue priority = new CustomerQueue(3);

        regular.enqueue(new Customer(101, "Amit"));
        regular.enqueue(new Customer(102, "Riya"));
        priority.enqueue(new Customer(201, "Senior Citizen"));

        Customer served = priority.isEmpty() ? regular.dequeue() : priority.dequeue();

        System.out.println("Served: " + served);
        System.out.println("Priority Queue: " + priority.snapshot());
        System.out.println("Regular Queue: " + regular.snapshot());
    }
}
