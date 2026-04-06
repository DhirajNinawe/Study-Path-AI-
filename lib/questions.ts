export interface PracticeQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  explanation?: string
}

export interface QuestionSet {
  topic: string
  questions: PracticeQuestion[]
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
}

// SQL Question Bank
export const sqlQuestions: PracticeQuestion[] = [
  // JOINs - Easy
  {
    id: 'join_1',
    question: 'Which JOIN returns only the matching rows from both tables?',
    options: [
      'INNER JOIN',
      'LEFT JOIN',
      'RIGHT JOIN',
      'FULL OUTER JOIN'
    ],
    correctAnswer: 0,
    topic: 'JOINs',
    difficulty: 'easy',
    explanation: 'INNER JOIN returns only the rows that have matching values in both tables.'
  },
  {
    id: 'join_2',
    question: 'What happens if you use LEFT JOIN and there is no match?',
    options: [
      'Returns NULL for all columns',
      'Returns only matching rows',
      'Returns all rows from left table and NULL for right table columns',
      'Returns an error'
    ],
    correctAnswer: 2,
    topic: 'JOINs',
    difficulty: 'easy',
    explanation: 'LEFT JOIN returns all rows from the left table and NULL for columns from the right table when there is no match.'
  },
  
  // JOINs - Medium
  {
    id: 'join_3',
    question: 'How many tables can you join in a single query?',
    options: [
      'Maximum 2 tables',
      'Maximum 3 tables',
      'Maximum 64 tables',
      'No specific limit (depends on database)'
    ],
    correctAnswer: 3,
    topic: 'JOINs',
    difficulty: 'medium',
    explanation: 'Most databases don\'t have a strict limit on the number of tables you can join, but performance may degrade with many joins.'
  },
  {
    id: 'join_4',
    question: 'What is the difference between INNER JOIN and JOIN?',
    options: [
      'JOIN is faster than INNER JOIN',
      'INNER JOIN is a syntax error',
      'They are the same thing',
      'JOIN works with more tables'
    ],
    correctAnswer: 2,
    topic: 'JOINs',
    difficulty: 'medium',
    explanation: 'INNER JOIN and JOIN are identical - JOIN is just shorthand for INNER JOIN.'
  },

  // JOINs - Hard
  {
    id: 'join_5',
    question: 'Which join type would you use to find all customers who have NOT placed any orders?',
    options: [
      'INNER JOIN',
      'LEFT JOIN with WHERE clause',
      'RIGHT JOIN',
      'FULL OUTER JOIN'
    ],
    correctAnswer: 1,
    topic: 'JOINs',
    difficulty: 'hard',
    explanation: 'Use LEFT JOIN customers LEFT JOIN orders and then filter WHERE orders.id IS NULL to find customers with no orders.'
  },
  {
    id: 'join_6',
    question: 'What is a self-join used for?',
    options: [
      'Joining a table with itself',
      'Creating duplicate tables',
      'Improving performance',
      'Replacing foreign keys'
    ],
    correctAnswer: 0,
    topic: 'JOINs',
    difficulty: 'hard',
    explanation: 'Self-joins are used to compare rows within the same table, like finding employees who report to the same manager.'
  },

  // Normalization - Easy
  {
    id: 'norm_1',
    question: 'What is the main purpose of database normalization?',
    options: [
      'To make queries faster',
      'To reduce data redundancy',
      'To increase security',
      'To improve backup'
    ],
    correctAnswer: 1,
    topic: 'Normalization',
    difficulty: 'easy',
    explanation: 'Normalization primarily aims to reduce data redundancy and improve data integrity.'
  },
  {
    id: 'norm_2',
    question: 'What does 1NF (First Normal Form) require?',
    options: [
      'No repeating groups',
      'No partial dependencies',
      'No transitive dependencies',
      'All of the above'
    ],
    correctAnswer: 0,
    topic: 'Normalization',
    difficulty: 'easy',
    explanation: '1NF requires that all attributes contain atomic values and no repeating groups.'
  },

  // Normalization - Medium
  {
    id: 'norm_3',
    question: 'What is a partial dependency?',
    options: [
      'When a non-key attribute depends on part of a composite key',
      'When all attributes depend on the entire key',
      'When attributes depend on other non-key attributes',
      'When there are no dependencies'
    ],
    correctAnswer: 0,
    topic: 'Normalization',
    difficulty: 'medium',
    explanation: 'Partial dependency occurs when a non-key attribute depends on only part of a composite primary key.'
  },
  {
    id: 'norm_4',
    question: 'Which normal form eliminates transitive dependencies?',
    options: [
      '1NF',
      '2NF',
      '3NF',
      'BCNF'
    ],
    correctAnswer: 2,
    topic: 'Normalization',
    difficulty: 'medium',
    explanation: '3NF eliminates transitive dependencies where non-key attributes depend on other non-key attributes.'
  },

  // Normalization - Hard
  {
    id: 'norm_5',
    question: 'What is the key difference between 3NF and BCNF?',
    options: [
      'BCNF allows more redundancy',
      '3NF is stricter than BCNF',
      'BCNF requires every determinant to be a candidate key',
      'There is no difference'
    ],
    correctAnswer: 2,
    topic: 'Normalization',
    difficulty: 'hard',
    explanation: 'BCNF is stricter than 3NF and requires that every determinant (attribute that determines another) must be a candidate key.'
  },
  {
    id: 'norm_6',
    question: 'When might you choose to denormalize a database?',
    options: [
      'To improve data integrity',
      'To improve read performance',
      'To reduce storage space',
      'Never, normalization is always better'
    ],
    correctAnswer: 1,
    topic: 'Normalization',
    difficulty: 'hard',
    explanation: 'Denormalization is sometimes done to improve read performance by reducing the number of joins needed.'
  },

  // Transactions - Easy
  {
    id: 'trans_1',
    question: 'What does the "A" in ACID stand for?',
    options: [
      'Atomicity',
      'Availability',
      'Authentication',
      'Authorization'
    ],
    correctAnswer: 0,
    topic: 'Transactions',
    difficulty: 'easy',
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.'
  },
  {
    id: 'trans_2',
    question: 'What happens when a transaction is rolled back?',
    options: [
      'All changes are saved',
      'All changes are undone',
      'Only the last change is undone',
      'The database is deleted'
    ],
    correctAnswer: 1,
    topic: 'Transactions',
    difficulty: 'easy',
    explanation: 'When a transaction is rolled back, all changes made during the transaction are undone.'
  },

  // Transactions - Medium
  {
    id: 'trans_3',
    question: 'Which isolation level prevents dirty reads but allows non-repeatable reads?',
    options: [
      'READ UNCOMMITTED',
      'READ COMMITTED',
      'REPEATABLE READ',
      'SERIALIZABLE'
    ],
    correctAnswer: 1,
    topic: 'Transactions',
    difficulty: 'medium',
    explanation: 'READ COMMITTED prevents dirty reads (reading uncommitted data) but allows non-repeatable reads.'
  },
  {
    id: 'trans_4',
    question: 'What is a deadlock?',
    options: [
      'When a transaction fails',
      'When two transactions wait for each other',
      'When the database is locked',
      'When data is corrupted'
    ],
    correctAnswer: 1,
    topic: 'Transactions',
    difficulty: 'medium',
    explanation: 'A deadlock occurs when two or more transactions are waiting for each other to release locks.'
  },

  // Transactions - Hard
  {
    id: 'trans_5',
    question: 'Which command saves all changes made in a transaction?',
    options: [
      'SAVEPOINT',
      'ROLLBACK',
      'COMMIT',
      'RELEASE'
    ],
    correctAnswer: 2,
    topic: 'Transactions',
    difficulty: 'hard',
    explanation: 'COMMIT permanently saves all changes made during the current transaction.'
  },
  {
    id: 'trans_6',
    question: 'What is the purpose of SAVEPOINT in transactions?',
    options: [
      'To create a backup',
      'To set a rollback point within a transaction',
      'To improve performance',
      'To lock specific rows'
    ],
    correctAnswer: 1,
    topic: 'Transactions',
    difficulty: 'hard',
    explanation: 'SAVEPOINT creates a marker within a transaction that you can roll back to, allowing partial rollbacks.'
  },

  // Indexes - Easy
  {
    id: 'idx_1',
    question: 'What is the main purpose of an index?',
    options: [
      'To save storage space',
      'To speed up data retrieval',
      'To improve security',
      'To backup data'
    ],
    correctAnswer: 1,
    topic: 'Indexes',
    difficulty: 'easy',
    explanation: 'Indexes are primarily used to speed up data retrieval operations on database tables.'
  },
  {
    id: 'idx_2',
    question: 'Which type of index is automatically created for primary keys?',
    options: [
      'Clustered index',
      'Non-clustered index',
      'Hash index',
      'No index is created'
    ],
    correctAnswer: 0,
    topic: 'Indexes',
    difficulty: 'easy',
    explanation: 'Most database systems automatically create a clustered index for primary key columns.'
  },

  // Indexes - Medium
  {
    id: 'idx_3',
    question: 'What is a disadvantage of having too many indexes?',
    options: [
      'Slower read operations',
      'Slower write operations',
      'More storage usage',
      'Both B and C'
    ],
    correctAnswer: 3,
    topic: 'Indexes',
    difficulty: 'medium',
    explanation: 'Too many indexes can slow down write operations (INSERT, UPDATE, DELETE) and use more storage space.'
  },
  {
    id: 'idx_4',
    question: 'When would you use a composite index?',
    options: [
      'For single column queries',
      'For queries on multiple columns',
      'For text search',
      'For large text fields'
    ],
    correctAnswer: 1,
    topic: 'Indexes',
    difficulty: 'medium',
    explanation: 'Composite indexes are used when you frequently query on multiple columns together.'
  },

  // Indexes - Hard
  {
    id: 'idx_5',
    question: 'What is the difference between clustered and non-clustered indexes?',
    options: [
      'Clustered indexes are faster',
      'Non-clustered indexes store data with the index',
      'Clustered indexes determine physical order of data',
      'There is no difference'
    ],
    correctAnswer: 2,
    topic: 'Indexes',
    difficulty: 'hard',
    explanation: 'Clustered indexes determine the physical order of data in the table, while non-clustered indexes are separate structures.'
  },
  {
    id: 'idx_6',
    question: 'What is a covering index?',
    options: [
      'An index that covers all columns',
      'An index that includes all columns needed for a query',
      'An index that covers multiple tables',
      'A special type of clustered index'
    ],
    correctAnswer: 1,
    topic: 'Indexes',
    difficulty: 'hard',
    explanation: 'A covering index includes all the columns needed for a query, allowing the database to answer the query using only the index.'
  }
]

// Computer Networks Question Bank
export const cnQuestions: PracticeQuestion[] = [
  {
    id: 'cn_1',
    question: 'Which OSI layer is responsible for logical addressing and routing?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correctAnswer: 1,
    topic: 'OSI Model',
    difficulty: 'easy',
    explanation: 'The Network Layer (Layer 3) handles logical addressing (IP) and routing packets between networks.'
  },
  {
    id: 'cn_2',
    question: 'What is the main difference between TCP and UDP?',
    options: ['TCP is faster', 'UDP is more reliable', 'TCP is connection-oriented, UDP is connectionless', 'Both are the same'],
    correctAnswer: 2,
    topic: 'Protocols',
    difficulty: 'easy',
    explanation: 'TCP (Transmission Control Protocol) is connection-oriented and reliable, while UDP (User Datagram Protocol) is connectionless and faster.'
  },
  {
    id: 'cn_3',
    question: 'What is the size of an IPv4 address?',
    options: ['16 bits', '32 bits', '64 bits', '128 bits'],
    correctAnswer: 1,
    topic: 'IP Addressing',
    difficulty: 'easy',
    explanation: 'An IPv4 address consists of 32 bits, typically represented as four decimal octets.'
  },
  {
    id: 'cn_4',
    question: 'Which protocol maps a domain name to an IP address?',
    options: ['HTTP', 'SMTP', 'DNS', 'DHCP'],
    correctAnswer: 2,
    topic: 'DNS',
    difficulty: 'easy',
    explanation: 'DNS (Domain Name System) translates human-readable domain names like google.com into IP addresses.'
  },
  {
    id: 'cn_5',
    question: 'What is the maximum number of usable IP addresses in a /24 subnet?',
    options: ['256', '255', '254', '252'],
    correctAnswer: 2,
    topic: 'IP Addressing',
    difficulty: 'medium',
    explanation: 'In a /24 subnet (256 addresses), two are reserved: the network address (.0) and the broadcast address (.255), leaving 254 usable addresses.'
  },
  {
    id: 'cn_6',
    question: 'What is the purpose of the Three-Way Handshake in TCP?',
    options: ['To encrypt the data', 'To synchronize sequence numbers and establish a connection', 'To compress the data', 'To check for viruses'],
    correctAnswer: 1,
    topic: 'Protocols',
    difficulty: 'medium',
    explanation: 'The three-way handshake (SYN, SYN-ACK, ACK) establishes a reliable connection by synchronizing sequence numbers.'
  }
]

// Operating Systems Question Bank
export const osQuestions: PracticeQuestion[] = [
  {
    id: 'os_1',
    question: 'What is a process safely defined as?',
    options: ['A program in storage', 'A thread only', 'A program in execution', 'A kernel module'],
    correctAnswer: 2,
    topic: 'Processes',
    difficulty: 'easy',
    explanation: 'A process is an instance of a computer program that is being executed.'
  },
  {
    id: 'os_2',
    question: 'Which scheduling algorithm can result in starvation?',
    options: ['Round Robin', 'First-Come First-Served', 'Priority Scheduling', 'All of the above'],
    correctAnswer: 2,
    topic: 'Scheduling',
    difficulty: 'easy',
    explanation: 'In Priority Scheduling, low-priority processes may never execute if high-priority processes are constantly arriving.'
  },
  {
    id: 'os_3',
    question: 'What is a deadlock?',
    options: ['A fast running process', 'Two processes waiting on each other for resources in a cycle', 'A process that never stops', 'A computer crash'],
    correctAnswer: 1,
    topic: 'Deadlocks',
    difficulty: 'easy',
    explanation: 'A deadlock occurs when a group of processes are blocked because each process is holding a resource and waiting for another resource held by another process.'
  },
  {
    id: 'os_4',
    question: 'What is the main purpose of Paging in memory management?',
    options: ['To speed up the CPU', 'To avoid external fragmentation', 'To increase disk space', 'To encrypt memory'],
    correctAnswer: 1,
    topic: 'Memory Management',
    difficulty: 'medium',
    explanation: 'Paging eliminates the need for contiguous allocation of physical memory, thus avoiding external fragmentation.'
  },
  {
    id: 'os_5',
    question: 'What is virtual memory?',
    options: ['Extra RAM installed', 'A simulation of memory', 'Using secondary storage as an extension of main memory', 'Memory used by virtual machines'],
    correctAnswer: 2,
    topic: 'Virtual Memory',
    difficulty: 'medium',
    explanation: 'Virtual memory allows a computer to compensate for physical memory shortages by temporarily transferring data from RAM to disk storage.'
  },
  {
    id: 'os_6',
    question: 'Which condition is NOT required for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption', 'Circular Wait'],
    correctAnswer: 2,
    topic: 'Deadlocks',
    difficulty: 'medium',
    explanation: 'Deadlock requires NO preemption. If resources can be preempted, deadlocks can be broken.'
  }
]

// Data Structures & Algorithms Question Bank
export const dsaQuestions: PracticeQuestion[] = [
  {
    id: 'dsa_1',
    question: 'What is the time complexity of searching an element in a balanced Binary Search Tree?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctAnswer: 2,
    topic: 'Trees',
    difficulty: 'easy',
    explanation: 'In a balanced BST, each comparison eliminates half the remaining nodes, leading to log n time.'
  },
  {
    id: 'dsa_2',
    question: 'Which data structure follows the LIFO (Last-In First-Out) principle?',
    options: ['Queue', 'Linked List', 'Stack', 'Heap'],
    correctAnswer: 2,
    topic: 'Stacks & Queues',
    difficulty: 'easy',
    explanation: 'A stack follows LIFO (Last-In First-Out), like a stack of plates.'
  },
  {
    id: 'dsa_3',
    question: 'What is the worst-case time complexity of Quick Sort?',
    options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(1)'],
    correctAnswer: 2,
    topic: 'Sorting',
    difficulty: 'medium',
    explanation: 'Worst case for Quick Sort is O(n²), occurring when the pivot is consistently the smallest or largest element.'
  },
  {
    id: 'dsa_4',
    question: 'Which sorting algorithm has a O(n log n) complexity in all cases (best, worst, average)?',
    options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort'],
    correctAnswer: 3,
    topic: 'Sorting',
    difficulty: 'medium',
    explanation: 'Merge Sort always divides the array in half and merges, resulting in O(n log n) regardless of initial order.'
  },
  {
    id: 'dsa_5',
    question: 'What is an advantage of a Linked List over an Array?',
    options: ['Random access speed', 'Memory efficiency', 'Dynamic size and easy insertion/deletion', 'Simplicity'],
    correctAnswer: 2,
    topic: 'Arrays & Lists',
    difficulty: 'easy',
    explanation: 'Linked Lists can grow dynamically and allow for O(1) insertions/deletions if the position is known.'
  },
  {
    id: 'dsa_6',
    question: 'What is the time complexity to insert a new node at the beginning of a singly linked list?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 0,
    topic: 'Arrays & Lists',
    difficulty: 'easy',
    explanation: 'Inserting at the head only requires updating a few pointers, making it a constant time operation.'
  }
]

// Subject-Specific Question Banks
export const SUBJECT_QUESTIONS: Record<string, PracticeQuestion[]> = {
  'DBMS': sqlQuestions,
  'CN': cnQuestions,
  'OS': osQuestions,
  'DSA': dsaQuestions,
}

// Subject-Specific Topics
export const SUBJECT_TOPICS: Record<string, string[]> = {
  'DBMS': ['JOINs', 'Normalization', 'Transactions', 'Indexes'],
  'CN': ['OSI Model', 'Protocols', 'IP Addressing', 'DNS'],
  'OS': ['Processes', 'Scheduling', 'Deadlocks', 'Memory Management', 'Virtual Memory'],
  'DSA': ['Arrays & Lists', 'Stacks & Queues', 'Trees', 'Sorting'],
}

// Topic explanations for revision
export const topicExplanations: Record<string, {
  basic: string
  intermediate: string
  advanced: string
}> = {
  'JOINs': {
    basic: 'JOINs are used to combine rows from two or more tables based on related columns. The most common type is INNER JOIN which returns only matching rows.',
    intermediate: 'Different JOIN types serve different purposes: INNER JOIN for matching rows, LEFT/RIGHT JOIN for all rows from one table, and FULL OUTER JOIN for all rows from both tables.',
    advanced: 'Advanced JOIN techniques include self-joins for hierarchical data, CROSS JOIN for cartesian products, and optimizing performance through indexing.'
  },
  'Normalization': {
    basic: 'Normalization is the process of organizing data to reduce redundancy. 1NF ensures atomic values, 2NF eliminates partial dependencies, and 3NF eliminates transitive dependencies.',
    intermediate: 'Understanding trade-offs between normalization levels and when to denormalize for performance is key for database design.',
    advanced: 'Advanced normalization includes BCNF, 4NF, and 5NF. Understanding functional, multivalued, and join dependencies helps in designing optimal database schemas.'
  },
  'Transactions': {
    basic: 'Transactions ensure data integrity through ACID properties: Atomicity, Consistency, Isolation, and Durability.',
    intermediate: 'Transaction isolation levels control visibility between concurrent transactions (dirty reads, non-repeatable reads, phantom reads).',
    advanced: 'Advanced management includes handling deadlocks, savepoints for partial rollbacks, and understanding two-phase commit protocols.'
  },
  'Indexes': {
    basic: 'Indexes speed up data retrieval by creating lookup structures. Clustered indexes sort actual data, non-clustered indexes point to it.',
    intermediate: 'Index design involves balancing read performance against write performance and storage costs.',
    advanced: 'Strategies include covering indexes, filtered indexes, hash vs B-tree, and fragmentation management.'
  },
  // CN Explanations
  'OSI Model': {
    basic: 'The OSI model is a 7-layer framework for standardizing network communication. Layers include Physical, Data Link, Network, Transport, Session, Presentation, and Application.',
    intermediate: 'Understanding how data is encapsulated as it moves down the layers (Segment, Packet, Frame, Bits) is crucial for troubleshooting.',
    advanced: 'Detailed knowledge of each layer protocols (Ethernet, IP, TCP, HTTP) and how layer-specific devices (Switches, Routers) interact.'
  },
  'Protocols': {
    basic: 'Protocols are sets of rules for data communication. TCP is reliable and slower, UDP is faster but unreliable.',
    intermediate: 'Deep dive into HTTP/S, FTP, SMTP, and DHCP. Understanding how state is managed in stateless protocols.',
    advanced: 'Analyzing sequence numbers, windowing in TCP, and cryptographic handshakes (TLS) used in modern protocols.'
  },
  'IP Addressing': {
    basic: 'IP addresses uniquely identify devices on a network. IPv4 is 32-bit, IPv6 is 128-bit.',
    intermediate: 'Subnetting allows dividing networks into smaller parts to better manage addresses and security.',
    advanced: 'CIDR notation, NAT (Network Address Translation), and designing complex multi-tiered network addressing schemes.'
  },
  'DNS': {
    basic: 'DNS acts as the "phonebook" of the internet, converting domain names into IP addresses.',
    intermediate: 'Understanding recursive vs iterative queries, TTL (Time to Live), and the role of Root and TLD servers.',
    advanced: 'Configuring DNS records (A, CNAME, MX, TXT) and DNSSEC for securing address resolution against poisoning.'
  },
  // OS Explanations
  'Processes': {
    basic: 'A process is a program in execution. It includes the code, data, and current activities.',
    intermediate: 'Difference between processes and threads, inter-process communication (IPC), and process lifecycle (New, Ready, Running, Waiting, Terminated).',
    advanced: 'Handling context switching overhead, CPU affinity, and orphan vs zombie process management in Unix-like systems.'
  },
  'Scheduling': {
    basic: 'CPU scheduling decides which process gets the CPU. Main algorithms: FCFS, Round Robin, SJF.',
    intermediate: 'Preemptive vs non-preemptive scheduling. Multi-level queue scheduling and handling high-priority interrupts.',
    advanced: 'Real-time scheduling (RMS, EDF) and load balancing strategies in multi-core / multi-processor environments.'
  },
  'Deadlocks': {
    basic: 'A deadlock is a cycle of processes waiting for resources. Necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.',
    intermediate: 'Deadlock avoidance using the Bankers Algorithm and detection techniques through resource-allocation graphs.',
    advanced: 'Implementing recovery strategies (process termination, resource preemption) and designing systems to be deadlock-free by construction.'
  },
  'Memory Management': {
    basic: 'Managing memory efficiently between the OS and programs. Uses techniques like Paging and Segmentation.',
    intermediate: 'Handling fragmentation (Internal vs External) and understanding how the MMU (Memory Management Unit) translates addresses.',
    advanced: 'Optimizing TLB (Translation Lookaside Buffer) hits and managing inverted page tables in 64-bit architectures.'
  },
  'Virtual Memory': {
    basic: 'Virtual memory makes the computer think it has more RAM than it actually does by using the hard drive.',
    intermediate: 'Page replacement algorithms (FIFO, LRU, Optimal) and the concept of demand paging.',
    advanced: 'Controlling thrashing through working set models and optimizing swap file / partition performance.'
  },
  // DSA Explanations
  'Arrays & Lists': {
    basic: 'Arrays store elements in contiguous memory. Linked Lists use pointers to connect nodes anywhere in memory.',
    intermediate: 'Time complexity differences: O(1) for array indexing vs O(n) for list traversal. O(1) for list insertion at head.',
    advanced: 'Designing skip lists, handling memory-efficient doubly linked lists, and optimizing dynamic array resizing (geometric expansion).'
  },
  'Stacks & Queues': {
    basic: 'Stacks are LIFO (Last-In First-Out). Queues are FIFO (First-In First-Out).',
    intermediate: 'Implementing queues using circular buffers and stacks using linked lists. Applications like function recursion (Stack) and BFS (Queue).',
    advanced: 'Implementing priority queues using heaps and lock-free concurrency for high-performance stack/queue operations.'
  },
  'Trees': {
    basic: 'Trees are hierarchical structures. Binary trees have at most two children. Each node has a parent and children.',
    intermediate: 'BST (Binary Search Tree) properties and traversal methods: Inorder (Sorted), Preorder, Postorder.',
    advanced: 'Self-balancing trees like AVL and Red-Black trees to ensure O(log n) operations. B-trees for database storage.'
  },
  'Sorting': {
    basic: 'Organizing data in a specific order. Simple algorithms: Bubble Sort, Selection Sort.',
    intermediate: 'Efficient algorithms like Quick Sort and Merge Sort. Stable vs unstable sorting and space complexity trade-offs.',
    advanced: 'Radix sort for integer data, TimSort (used in Python/Java), and external sorting algorithms for data larger than RAM.'
  },
}

export function getQuestionsBySubject(subject: string, topic: string, difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'): PracticeQuestion[] {
  const bank = SUBJECT_QUESTIONS[subject] || sqlQuestions
  const topicQuestions = bank.filter(q => q.topic === topic)
  
  if (difficulty === 'mixed') {
    return topicQuestions
  }
  
  return topicQuestions.filter(q => q.difficulty === difficulty)
}

export function getRandomQuestions(subjectOrTopic: string, count: number, difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'): PracticeQuestion[] {
  // If the first argument is a subject ID (e.g. 'CN'), get questions for that subject
  if (SUBJECT_QUESTIONS[subjectOrTopic]) {
    const bank = SUBJECT_QUESTIONS[subjectOrTopic]
    const filtered = difficulty === 'mixed' ? bank : bank.filter(q => q.difficulty === difficulty)
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }
  
  // Otherwise treated as a topic name (backward compatibility)
  const allQuestions = [...sqlQuestions, ...cnQuestions, ...osQuestions, ...dsaQuestions]
  const qByTopic = allQuestions.filter(q => q.topic === subjectOrTopic)
  const filtered = difficulty === 'mixed' ? qByTopic : qByTopic.filter(q => q.difficulty === difficulty)
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function getReadinessTestQuestions(subject: string, topic: string): PracticeQuestion[] {
  // Pass subject to ensure correct bank
  const getRand = (diff: 'easy' | 'medium' | 'hard') => {
    const bank = SUBJECT_QUESTIONS[subject] || sqlQuestions
    const filtered = bank.filter(q => q.topic === topic && q.difficulty === diff)
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, 2)
  }
  
  const easy = getRand('easy')
  const medium = getRand('medium')
  const hard = getRand('hard')
  
  return [...easy, ...medium, ...hard].sort(() => Math.random() - 0.5)
}

export const availableTopics = ['JOINs', 'Normalization', 'Transactions', 'Indexes']
