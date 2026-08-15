---
layout: leetcode
title: "Implement Stack using Queues"
permalink: /study/leetcodes/0225-implement-stack-using-queues
leetcode_id: 225
difficulty: Easy
leetcode_url: https://leetcode.com/problems/implement-stack-using-queues/
primary_pattern: "Design Problems"
topics:
  - "Stack"
  - "Design"
  - "Queue"
date_solved: 2026-08-15
time_taken: "04:13"
language: Python3
---

# Implement Stack using Queues

- **Difficulty:** Unknown
- **Primary pattern:** Design Problems
- **Tags:** Stack, Design, Queue
- **Time taken:** 04:13
- [LeetCode Link](https://leetcode.com/problems/implement-stack-using-queues/)

## Key Idea

- Last in First Out Queue, can only read from the front, aka index [0]
- You need to iterate and kepe the last element in front

## Solution

```python
class MyStack:
    # You can only append to back and read from front
    def __init__(self):
        self.queue = []

    def push(self, x: int) -> None:
        # Append to back
        self.queue.append(x)
        # Read from the front till -1
        # Note since we iterate TILL -1, means we keep it "last" at new list
        for i in range(len(self.queue) -1):
            self.queue.append(self.queue.pop(0))

    def pop(self) -> int:
        # Last in first Out
        return self.queue.pop(0)        

    def top(self) -> int:
        return self.queue[0]

    def empty(self) -> bool:
        if not self.queue:
            return True
        return False


# Your MyStack object will be instantiated and called as such:
# obj = MyStack()
# obj.push(x)
# param_2 = obj.pop()
# param_3 = obj.top()
# param_4 = obj.empty()
```

## Complexity

- Time: O(n)
- Space: O(n)
