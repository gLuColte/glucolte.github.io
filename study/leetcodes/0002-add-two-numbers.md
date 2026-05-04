---
layout: leetcode
title: "Add Two Numbers"
permalink: /study/leetcodes/0002-add-two-numbers
leetcode_id: 2
difficulty: Medium
leetcode_url: https://leetcode.com/problems/add-two-numbers/
primary_pattern: "Linked Lists"
topics:
  - "Linked List"
  - "Math"
  - "Recursion"
date_solved: 2026-05-04
time_taken: "06:36"
language: Python3
---

# Add Two Numbers

- **Difficulty:** Medium
- **Primary pattern:** Linked Lists
- **Tags:** Linked List, Math, Recursion
- **Time taken:** 06:36
- [LeetCode Link](https://leetcode.com/problems/add-two-numbers/)

## Key Idea

- Understand that you are "reversing" the output
- Getting familar on how to "move" the digit in LinkedList


## Solution

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # Initialize
        dummy = ListNode()
        current = dummy
        carry = 0

        # Iterate if any contains value
        while l1 or l2 or carry:
            # Set val1 and val2
            val1 = l1.val if l1 else 0
            val2 = l2.val if l2 else 0
            # Get the total
            total = val1 + val2 + carry

            # Find digit and carry
            digit = total % 10
            carry = total // 10

            # Set the next node to digit
            current.next = ListNode(digit)
            # Move the "output pointer" to next
            current = current.next

            # Move the list pointers
            if l1:
                l1 = l1.next
            if l2:
                l2 = l2.next
        # Return
        return dummy.next
```

## Complexity

- Time: O(max(n,m))
- Space: O(max(n,m))
