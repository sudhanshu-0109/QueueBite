/* ============================================
   SMART CANTEEN – Queue (Linked-List DSA Core)
   ============================================ */

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  /** Add an order to the back of the queue – O(1) */
  enqueue(order) {
    const node = new Node(order);
    if (!this.rear) {
      this.front = this.rear = node;
    } else {
      this.rear.next = node;
      this.rear = node;
    }
    this.size++;
    this._persist();
  }

  /** Remove and return the front order – O(1) */
  dequeue() {
    if (this.isEmpty()) return null;
    const data = this.front.data;
    this.front = this.front.next;
    if (!this.front) this.rear = null;
    this.size--;
    this._persist();
    return data;
  }

  /** View the front order without removing – O(1) */
  peek() {
    return this.front ? this.front.data : null;
  }

  /** Check if the queue is empty – O(1) */
  isEmpty() {
    return this.size === 0;
  }

  /** Convert to array (for persistence / rendering) – O(n) */
  toArray() {
    const arr = [];
    let current = this.front;
    while (current) {
      arr.push(current.data);
      current = current.next;
    }
    return arr;
  }

  /** Find position of an order by ID (1-indexed) – O(n) */
  positionOf(id) {
    let i = 1;
    let current = this.front;
    while (current) {
      if (current.data.id === id) return i;
      current = current.next;
      i++;
    }
    return -1;
  }

  /** Remove a specific order by ID – O(n) */
  removeById(id) {
    if (this.isEmpty()) return null;

    // Check front
    if (this.front.data.id === id) {
      return this.dequeue();
    }

    let prev = this.front;
    let current = this.front.next;
    while (current) {
      if (current.data.id === id) {
        prev.next = current.next;
        if (current === this.rear) {
          this.rear = prev;
        }
        this.size--;
        this._persist();
        return current.data;
      }
      prev = current;
      current = current.next;
    }
    return null;
  }

  /** Rebuild linked list from an array (on page load) */
  fromArray(arr) {
    this.front = null;
    this.rear = null;
    this.size = 0;
    if (!Array.isArray(arr)) return;
    arr.forEach(item => {
      const node = new Node(item);
      if (!this.rear) {
        this.front = this.rear = node;
      } else {
        this.rear.next = node;
        this.rear = node;
      }
      this.size++;
    });
  }

  /** Get sum of prep times for all orders – O(n) */
  totalPrepTime() {
    let total = 0;
    let current = this.front;
    while (current) {
      total += (current.data.prepMinutes || 0);
      current = current.next;
    }
    return total;
  }

  /** Get orders ahead of a given order ID – O(n) */
  ordersAhead(id) {
    let count = 0;
    let current = this.front;
    while (current) {
      if (current.data.id === id) return count;
      count++;
      current = current.next;
    }
    return -1;
  }

  /** Prep time of orders ahead of given ID – O(n) */
  prepTimeAhead(id) {
    let total = 0;
    let current = this.front;
    while (current) {
      if (current.data.id === id) return total;
      total += (current.data.prepMinutes || 0);
      current = current.next;
    }
    return total;
  }

  /** Save queue state to localStorage */
  _persist() {
    Storage.save('sc_queue', this.toArray());
  }

  /** Load queue from localStorage */
  load() {
    const arr = Storage.load('sc_queue', []);
    this.fromArray(arr);
  }
}

// Global queue instance
const orderQueue = new Queue();
