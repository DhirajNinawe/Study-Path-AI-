import type { TestQuestion } from "./diagnostic-types"

const q = (
  id: number,
  question: string,
  options: [string, string, string, string],
  correctAnswer: 0 | 1 | 2 | 3,
  topic: string
): TestQuestion => ({
  id,
  question,
  options: [...options],
  correctAnswer,
  topic,
})

export const DIAGNOSTIC_QUESTION_BANKS: Record<string, TestQuestion[]> = {
  DBMS: [
    q(1, "Which normal form eliminates transitive dependency?", ["1NF", "2NF", "3NF", "BCNF"], 2, "Normalization"),
    q(2, "What does ACID stand for in database transactions?", ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Consistency, Integrity, Data", "Atomicity, Correctness, Isolation, Dependency", "Access, Control, Integrity, Data"], 0, "Transactions"),
    q(3, "Which JOIN returns all rows when there is a match in either table?", ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], 3, "JOIN Operations"),
    q(4, "What is the main purpose of an index?", ["Store backups", "Speed up retrieval", "Enforce 3NF", "Replace primary keys"], 1, "Indexing"),
    q(5, "Which key uniquely identifies a row in a table?", ["Foreign Key", "Primary Key", "Super Key only", "Alternate Key only"], 1, "Keys & Constraints"),
    q(6, "What is a deadlock?", ["Query timeout", "Transactions wait on each other in a cycle", "Disk full", "Lost update anomaly"], 1, "Transactions"),
    q(7, "Which command removes all rows with minimal logging in many DBMS?", ["DELETE", "DROP", "TRUNCATE", "PURGE"], 2, "SQL Commands"),
    q(8, "A foreign key establishes what?", ["Only 1:1 rows", "Referential link between tables", "Encryption", "Sharding"], 1, "Keys & Constraints"),
    q(9, "Which clause is used with aggregates on grouped rows?", ["WHERE", "ORDER BY", "GROUP BY", "HAVING"], 3, "SQL Commands"),
    q(10, "2NF removes which dependency?", ["Repeating groups", "Partial key dependency", "Transitive dependency", "Multivalued dependency"], 1, "Normalization"),
    q(11, "Which index type determines physical row order?", ["Hash", "Clustered", "Bitmap only", "Inverted"], 1, "Indexing"),
    q(12, "Which isolation level typically prevents dirty reads?", ["Read Uncommitted", "Read Committed", "Read Unstable", "No isolation"], 1, "Transactions"),
  ],
  DSA: [
    q(1, "Time complexity of binary search on a sorted array?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "Searching & Sorting"),
    q(2, "Which structure is naturally LIFO?", ["Queue", "Stack", "Deque only", "Heap"], 1, "Stacks & Queues"),
    q(3, "Worst-case time complexity of QuickSort?", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], 2, "Searching & Sorting"),
    q(4, "Which traversal visits the root before subtrees?", ["Inorder", "Preorder", "Postorder", "Level-order"], 1, "Trees & Graphs"),
    q(5, "Array element access by index is:", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2, "Arrays & Hashing"),
    q(6, "Shortest paths in a weighted graph with non-negative edges?", ["DFS only", "BFS only", "Dijkstra", "Topological sort only"], 2, "Trees & Graphs"),
    q(7, "Best structure for a typical priority queue?", ["Stack", "Queue", "Binary heap", "Array unsorted"], 2, "Stacks & Queues"),
    q(8, "Space complexity of merge sort?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 2, "Searching & Sorting"),
    q(9, "FIFO behavior matches:", ["Stack", "Queue", "Trie", "BST"], 1, "Stacks & Queues"),
    q(10, "Insert at head of singly linked list?", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2, "LinkedLists"),
    q(11, "Which sort is stable in the classic treatment?", ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], 2, "Searching & Sorting"),
    q(12, "Recursion depth is limited by:", ["CPU cache only", "Call stack / language limits", "Heap size only", "Array length"], 1, "Recursion"),
  ],
  OS: [
    q(1, "A process is best described as:", ["A file on disk", "A program in execution", "A thread only", "A device driver"], 1, "Processes"),
    q(2, "Which scheduling can starve low-priority jobs?", ["Round Robin", "FCFS", "Priority scheduling", "SJF non-preemptive"], 2, "Scheduling"),
    q(3, "Deadlock means:", ["High CPU usage", "Circular wait for resources", "Page fault storm", "Kernel panic"], 1, "Deadlocks"),
    q(4, "External fragmentation is common with:", ["Paging", "Segmentation", "TLB", "DMA"], 1, "Memory Management"),
    q(5, "Semaphores are mainly for:", ["Paging", "Synchronization", "Disk scheduling", "File naming"], 1, "Processes"),
    q(6, "Optimal page replacement needs:", ["FIFO queue", "Future reference knowledge", "Random eviction", "Single frame"], 1, "Memory Management"),
    q(7, "Thrashing refers to:", ["Fast CPU", "Excessive paging", "Disk formatting", "IRQ storms"], 1, "Memory Management"),
    q(8, "Which is NOT a necessary deadlock condition?", ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], 2, "Deadlocks"),
    q(9, "PCB stores:", ["Page tables only", "Process metadata/state", "Inode data", "Socket payloads"], 1, "Processes"),
    q(10, "Minimum average waiting time (theory) often with:", ["FCFS", "SJF", "RR q=1", "Random"], 1, "Scheduling"),
    q(11, "Critical section is code that:", ["Never fails", "Accesses shared resources", "Runs in kernel only", "Uses SIMD"], 1, "Processes"),
    q(12, "TLB stands for:", ["Translation Lookaside Buffer", "Table Lookup Block", "Thread Level Balance", "Transfer Line Bus"], 0, "Memory Management"),
  ],
  CN: [
    q(1, "OSI layer responsible for routing between networks?", ["Data Link", "Network", "Transport", "Session"], 1, "OSI Model"),
    q(2, "Which protocol is connection-oriented and reliable?", ["UDP", "TCP", "ICMP", "ARP"], 1, "TCP/IP"),
    q(3, "ARP maps:", ["URL to IP", "IP to MAC", "Port to process", "DNS to TLS"], 1, "Protocols"),
    q(4, "HTTP is typically considered:", ["Layer 2", "Layer 3", "Application layer", "Physical"], 2, "OSI Model"),
    q(5, "Subnet mask helps:", ["Encrypt payloads", "Divide networks", "Replace DNS", "Compress frames"], 1, "Network Layers"),
    q(6, "A switch commonly operates at:", ["Physical", "Data Link", "Network", "Application"], 1, "OSI Model"),
    q(7, "Default HTTP port?", ["21", "22", "80", "443"], 2, "Protocols"),
    q(8, "DNS primarily:", ["Routes packets", "Resolves names to addresses", "Encrypts Wi‑Fi", "Assigns MACs"], 1, "Protocols"),
    q(9, "UDP is:", ["Connection-oriented", "Connectionless", "Always reliable", "Layer-2 only"], 1, "TCP/IP"),
    q(10, "IPv4 address size?", ["16 bits", "32 bits", "64 bits", "128 bits"], 1, "Network Layers"),
    q(11, "NAT is used to:", ["Encrypt traffic", "Map private to public addresses", "Replace TCP", "Assign MACs"], 1, "Network Layers"),
    q(12, "DHCP provides:", ["Name resolution", "Dynamic host configuration", "TLS certs", "Routing tables"], 1, "Protocols"),
  ],
}

export function getDiagnosticQuestionsForSubject(subject: string): TestQuestion[] {
  return DIAGNOSTIC_QUESTION_BANKS[subject] ?? DIAGNOSTIC_QUESTION_BANKS.DBMS
}
