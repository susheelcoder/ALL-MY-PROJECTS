# Verification System

A complete digital document generation and verification system.

This project can generate:

- Offer Letter
- Joining Letter
- Experience Letter

and provides:

- QR Code Verification
- Document ID Verification
- PDF Download
- Document Management System


---

# Project Structure


verification-system/

│

├── index.html

├── offer-letter.html

├── joining-letter.html

├── experience-letter.html

├── verify.html


│

├── assets/

│   ├── css/

│   │   ├── style.css

│   │   ├── letter.css

│   │   ├── form.css

│   │   └── verify.css


│   ├── js/

│   │   ├── app.js

│   │   ├── offer.js

│   │   ├── joining.js

│   │   ├── experience.js

│   │   ├── qr.js

│   │   ├── verify.js

│   │   ├── pdf.js

│   │   └── database.js


│

├── data/

│   ├── documents.json

│   └── templates.json


│

├── backend/

│   ├── server.js

│   ├── routes/

│   ├── controllers/

│   ├── middleware/

│   └── config/


│

└── README.md



---

# Features


## Document Generator

### Offer Letter

Create professional offer letters with:

- Employee Details
- Company Details
- Salary
- Joining Date
- QR Code


### Joining Letter

Generate joining confirmation documents:

- Employee ID
- Department
- Manager Details
- Joining Date


### Experience Letter

Generate experience certificates:

- Work Period
- Designation
- Department
- Work Description



---

# Verification System


Every generated document contains:

- Unique Document ID
- QR Code
- Verification Status


Verification Flow:


Create Document

↓

Generate ID

↓

Generate QR Code

↓

Save Database

↓

Verify Online



---

# Frontend Technology


- HTML5
- CSS3
- JavaScript
- Local Storage
- QR Code Library
- HTML2PDF Library



---

# Backend Technology


- Node.js
- Express.js
- JSON Database


---

# Installation


## Step 1

Install Node.js


## Step 2

Open Project Folder


## Step 3

Install Packages


```bash
npm install express cors body-parser
