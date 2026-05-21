---
layout: leetcode
title: "Remove Nth Node From End of List"
permalink: /study/leetcodes/0019-remove-nth-node-from-end-of-list
leetcode_id: 19
difficulty: Medium
leetcode_url: https://leetcode.com/problems/remove-nth-node-from-end-of-list/
primary_pattern: "Linked Lists"
topics:
  - "Linked List"
  - "Two Pointers"
date_solved: 2026-05-21
time_taken: "10:07"
language: Python3
---

# Remove Nth Node From End of List

- **Difficulty:** Medium
- **Primary pattern:** Linked Lists
- **Tags:** Linked List, Two Pointers
- **Time taken:** 10:07
- [LeetCode Link](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)

## Key Idea

- Read the question carefully, it says from the "END OF THE LIST"
- You have slow and fast pointers:
```
Example: remove 2nd node from end

dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
  S
  F

Move fast 2 steps first:

dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
  S      F

dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
  S           F

Now move slow and fast together:

dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
         S          F

dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
              S          F

dummy -> 1 -> 2 -> 3 -> 4 -> 5 -> None
                   S          F

Stop because fast is at the last node.

slow is at 3.
slow.next is 4.
So 4 is the node to remove.

Before:

3 -> 4 -> 5

Do:

slow.next = slow.next.next

After:

3 -> 5

Final:

dummy -> 1 -> 2 -> 3 -> 5 -> None
```


## Solution

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        # Inputs = head: Optional[ListNode], n
        # Outputs = Optional[ListNode]

        # Initialize
        dummy = ListNode(val=0)
        dummy.next = head

        fast = dummy
        slow = dummy

        # Move fast n steps ahead
        for _ in range(n):
            fast = fast.next
        
        # Move both until fast ist at the last node
        while fast.next:
            fast = fast.next
            slow = slow.next
        
        # Remove slow.next
        slow.next = slow.next.next
        return dummy.next
```

## Complexity

- Time: O(L) -> L is length of linked list
- Space: O(1)
