# SAI UNIVERSITY
## School of Computing and Data Science
### B.Tech Computer Science | Academic Year 2026–2027
### Web Technology and Internet Programming – Individual Project
# Campus Lost and Found Portal

**Student Name:** [Your name]  
**Register/Roll Number:** [Your number]  
**Section:** [Your section]  
**Course:** Web Technology and Internet Programming  
**Submission Date:** 30 November 2026

---

## 1. Abstract
The Campus Lost and Found Portal is a responsive, database-driven web application designed to help students report lost belongings and publish found items on campus. Users can register, log in, create item reports, search and filter listings, submit claims, and track their claims. Administrators can review claims, update item status, and view basic statistics. The application uses HTML, CSS and JavaScript for the frontend, Node.js and Express.js for the backend, and MongoDB for persistent storage.

## 2. Introduction and Problem Statement
Students may lose personal belongings around campus. A person who finds an item may not know its owner. This project provides a central online platform to publish lost/found reports and help reconnect items with their owners.

## 3. Objectives
- Provide a single platform for lost and found reports.
- Allow authenticated users to create and manage listings.
- Support keyword search and category/location/type filters.
- Allow users to submit claims and administrators to review them.
- Store records persistently in MongoDB.
- Provide a responsive interface for desktop and mobile devices.

## 4. System Requirements
**Software:** Node.js, Express.js, MongoDB, HTML5, CSS3, JavaScript ES6+, Postman, Git and GitHub.  
**Hardware:** Computer with internet access and a modern web browser.

## 5. System Design
**Architecture:** Browser frontend → Express REST API → Mongoose models → MongoDB database.

**Main modules:** Authentication, item reports, search/filter, claims, user dashboard, admin dashboard.

**Suggested diagrams to insert:** Use-case diagram, system architecture diagram, and application flowchart.

## 6. Database Design
- **User:** name, email, password hash, role, timestamps.
- **Item:** title, category, description, location, item date, type, image URL, status, postedBy, timestamps.
- **Claim:** item, claimant, message, status, timestamps.

Passwords are hashed using bcrypt. JWT tokens protect authenticated API routes. Admin routes use role-based authorization.

## 7. Implementation
Explain the frontend pages, JavaScript Fetch API calls, Express routes, middleware, Mongoose schemas, validation, authentication, and error handling. Include selected code screenshots and explain them in your own words.

## 8. Additional Feature
**Date sorting:** Users can sort item listings by newest first or oldest first. The frontend sends the selected sort option to the API, and the backend sorts records using the item date.

## 9. Screenshots
Insert your own screenshots of:
1. Home page
2. Registration and login
3. Item report form
4. Search and filter results
5. User dashboard
6. Admin dashboard
7. Postman successful API response
8. Postman invalid/unauthorized API response

## 10. API Testing
Import the supplied Postman collection and execute at least eight test cases. Add a table with actual results:

| Test case | Expected result | Actual result | Status |
|---|---|---|---|
| Health check | 200 OK | [Fill] | [Pass/Fail] |
| User registration | 201 Created | [Fill] | [Pass/Fail] |
| User login | 200 OK and token | [Fill] | [Pass/Fail] |
| Invalid item input | 400 Bad Request | [Fill] | [Pass/Fail] |
| Retrieve items | 200 OK | [Fill] | [Pass/Fail] |
| Create item | 201 Created | [Fill] | [Pass/Fail] |
| Update item | 200 OK | [Fill] | [Pass/Fail] |
| Unauthorized create | 401 Unauthorized | [Fill] | [Pass/Fail] |
| Retrieve claims | 200 OK | [Fill] | [Pass/Fail] |
| Student access to admin route | 403 Forbidden | [Fill] | [Pass/Fail] |

## 11. Deployment
**GitHub repository:** [Paste your repository URL]  
**Deployed application:** [Paste your live URL]  
Describe the hosting configuration and environment variables. Do not include passwords or secrets.

## 12. Results and Discussion
Describe the features that worked during testing. Mention any limitations honestly and explain how the application supports campus lost-and-found coordination.

## 13. Conclusion and Future Enhancements
The project demonstrates a full-stack web application with authentication, database CRUD operations, REST APIs, search, claims, and role-based access. Future improvements may include image uploads, email notifications, duplicate-item alerts, and campus building filters.

## 14. References
- Course project specification provided by Sai University.
- Official Node.js documentation: https://nodejs.org/docs/
- Express documentation: https://expressjs.com/
- MongoDB documentation: https://www.mongodb.com/docs/
- Postman documentation: https://learning.postman.com/

## 15. AI Assistance Disclosure
[State truthfully which AI tools were used and how. Review and understand all generated code and make your own changes as required by the course instructor.]
