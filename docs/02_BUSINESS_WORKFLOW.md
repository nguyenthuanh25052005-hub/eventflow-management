# 02. Business Workflow

# EventFlow - Business Workflow

---

## Document Information

| Item | Information |
|------|-------------|
| Project | EventFlow – Event Management System |
| Document | Business Workflow |
| Version | 1.0 |
| Status | Draft |
| Author | Nguyen Thi Thu Anh |

---

## 1. Purpose

This document describes the end-to-end business workflow of the EventFlow system. It serves as the foundation for database design, API specification, and software development.

---

## 2. Business Workflow Overview

```text
Customer
    │
    ▼
Submit Event Request
    │
    ▼
Event Manager Reviews Request
    │
    ▼
Create Event Plan
    │
    ▼
Assign Designer & Staff
    │
    ▼
Designer Uploads Concept
    │
    ▼
Customer Reviews Design
    │
    ▼
Accountant Creates Quotation
    │
    ▼
Customer Approves Quotation
    │
    ▼
Execute Event
    │
    ▼
Payment
    │
    ▼
Completed
```

---

## 3. Workflow Description

| Step | Actor | Activity | Output |
|------|-------|----------|--------|
| 1 | Customer | Submit event request | Request created |
| 2 | Event Manager | Review request | Accepted / Rejected |
| 3 | Event Manager | Create event plan | Event created |
| 4 | Event Manager | Assign staff | Tasks assigned |
| 5 | Designer | Upload design | Design version |
| 6 | Customer | Review design | Approved / Feedback |
| 7 | Accountant | Create quotation | Quotation |
| 8 | Customer | Approve quotation | Approved |
| 9 | Event Team | Execute event | In Progress |
| 10 | Accountant | Record payment | Paid |
| 11 | Customer | Submit review | Completed |

---

## 4. Event Status Flow

```text
Pending
   │
Consulting
   │
Planning
   │
Designing
   │
Quoted
   │
Approved
   │
In Progress
   │
Completed

Alternative:
Cancelled
```

---

## 5. Business Rules

1. Customers must log in before submitting an event request.
2. Every request must be reviewed by an Event Manager.
3. One event may contain multiple tasks.
4. One event may contain multiple design versions.
5. A quotation must be approved before execution.
6. Payment status can only be updated by an Accountant.
7. Completed events cannot be modified except by an Administrator.

---

## 6. Role Responsibilities

| Role | Responsibilities |
|------|------------------|
| Customer | Submit requests, approve designs, approve quotations, make payments, review services |
| Event Manager | Plan events, assign staff, monitor progress |
| Designer | Upload and update design concepts |
| Accountant | Create quotations and manage payments |
| Administrator | Manage users, permissions and system configuration |

---

## 7. Outputs

This workflow serves as the basis for:

- System Requirements
- Database Design
- API Specification
- Backend Development
- Frontend Development
