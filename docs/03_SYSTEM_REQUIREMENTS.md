# 03. System Requirements

# EventFlow - System Requirements

---

## Document Information

| Item | Information |
|------|-------------|
| Project | EventFlow – Event Management System |
| Document | System Requirements |
| Version | 1.0 |
| Status | Draft |
| Author | Nguyen Thi Thu Anh |

---

# 1. Purpose

This document defines the high-level system requirements for the EventFlow platform. It provides the functional requirements, non-functional requirements, business rules, assumptions, and constraints that guide the design and implementation of the system.

---

# 2. System Overview

EventFlow is a web-based event management platform that enables customers and internal staff to manage the complete lifecycle of an event through a centralized system.

Primary users include:

- Customer
- Event Manager
- Designer
- Accountant
- Administrator

---

# 3. Functional Requirements

## 3.1 Authentication

- User registration
- User login
- JWT authentication
- Password encryption
- Password reset
- Role-Based Access Control (RBAC)

## 3.2 Customer Management

- Manage customer profile
- Submit event requests
- View quotations
- Track event progress
- Submit reviews

## 3.3 Event Management

- Create events
- Update event information
- Assign staff
- Manage event timeline
- Monitor event status

## 3.4 Task Management

- Create tasks
- Assign tasks
- Update task status
- Set priorities
- Track deadlines

## 3.5 Design Management

- Upload design files
- Version control
- Customer feedback
- Design approval

## 3.6 Quotation & Payment

- Create quotations
- Approve quotations
- Record deposits
- Record final payments
- Track payment status

## 3.7 Dashboard

- Revenue statistics
- Event statistics
- Employee performance
- Monthly reports

---

# 4. Non-functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Response time should be under 2 seconds. |
| Security | JWT authentication and encrypted passwords. |
| Availability | 24/7 availability except scheduled maintenance. |
| Scalability | Support future module expansion. |
| Maintainability | Modular architecture and clean code. |
| Reliability | Prevent data inconsistency and unexpected failures. |
| Usability | Responsive and user-friendly interface. |

---

# 5. Business Rules

- Every event request must belong to one customer.
- One event can contain multiple tasks.
- One event can contain multiple design versions.
- Quotations must be approved before execution.
- Payments are managed only by accountants.
- Completed events are read-only except for administrators.

---

# 6. Assumptions

- All users have internet access.
- Customers create an account before submitting requests.
- Staff members are assigned appropriate roles.
- MongoDB is available throughout development.
- Email notifications will be implemented in a future phase.

---

# 7. Constraints

- Initial release is web-based only.
- Payment gateway integration is not included in Version 1.0.
- Mobile applications are out of scope.
- Third-party supplier integration is deferred.
- Multi-language support is planned for future releases.

---

# 8. Acceptance Criteria

The system will be considered acceptable when:

- Authentication works correctly.
- Core business modules are functional.
- API endpoints return expected results.
- Database supports all business workflows.
- User interface is responsive.
- Documentation is complete.

---

# 9. Related Documents

- 01_PROJECT_OVERVIEW.md
- 02_BUSINESS_WORKFLOW.md
- 06_DATABASE_DESIGN.md
- 08_API_SPECIFICATION.md
