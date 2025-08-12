<p align="center">
  <img src="logo.png" alt="Hospital Management System" width="140" />
</p>


Hospital Management System – Backend Update
- Happy to share that all RESTful API endpoints for Appointments, Doctors, Patients, Slots, - Authentication, and Mail Notifications have been successfully implemented and verified. - - The backend is now feature-complete, ensuring stability and smooth integration with the - - rest of the system.

Thank you for your patience and support throughout the development — looking forward to seeing everything in action!

## Tech Stack ##
---------------

![Nest.js](https://img.shields.io/badge/Backend-Nest.js-brightgreen)
![PostgreSQL](https://img.shields.io/badge/DataBase-PostgreSQL-fuchsia)
![TypeORM](https://img.shields.io/badge/ORM-TypeORM-blue)
![JWT](https://img.shields.io/badge/Authentication-JWT-lightsalmon)
![class-validator](https://img.shields.io/badge/class-validator-palevioletred)
- @nestjs/config
---------------------------------------------------------------------------------------------
# 📌 API Endpoints

## 🔐 AuthController
All authentication APIs are implemented and fully functional.  
**Base Path:** `/api/auth`

| Method   | Endpoint                 | Description                          |
|----------|--------------------------|---------------------------------------|
| 📥 **POST** | `/login`                 | User login (JWT issued)               |
| 🩺 **POST** | `/register/doctor`       | Register a new doctor account         |
| 🧑‍⚕️ **POST** | `/register/patient`      | Register a new patient account        |
| 🚪 **POST** | `/patient/logout`        | Logout patient                        |
| 🚪 **POST** | `/doctor/logout`         | Logout doctor                         |
| 📋 **GET**  | `/patient`               | Get all patients (auth required)      |
| 🆔 **GET**  | `/patient/profile`       | Get authenticated patient’s profile   |
| 🆔 **GET**  | `/doctor/profile`        | Get authenticated doctor’s profile    |

---

### 👨‍⚕️ Patients
| Method    | Endpoint                | Description             |
|-----------|-------------------------|-------------------------|
| ✏️ **PATCH** | `/api/patients/:id`     | Update patient details   |
| 📋 **GET**   | `/api/patients`         | Get all patients         |

---

### ⏳ Slots
| Method    | Endpoint                     | Description                     |
|-----------|------------------------------|---------------------------------|
| ➕ **POST**  | `/api/slots`                 | Create a slot                   |
| 📋 **GET**   | `/api/slots`                 | Get all slots                   |
| 📋 **GET**   | `/api/slots/doctor/:id`      | Get slots for a specific doctor |
| 🚫 **PATCH** | `/api/slots/:id/unavailable` | Mark a slot as unavailable      |

---

### 📅 Appointments
| Method    | Endpoint                              | Description                     |
|-----------|---------------------------------------|---------------------------------|
| 📅 **POST**  | `/api/appointments/book`             | Book an appointment            |
| 📋 **GET**   | `/api/appointments/patient/:id`      | Get all appointments for patient|
| 📋 **GET**   | `/api/appointments`                  | Get all appointments           |
| ❌ **PATCH** | `/api/appointments/cancel/:id`       | Cancel an appointment          |
| 🔄 **PATCH** | `/api/appointments/reschedule/:id`   | Reschedule an appointment      |

---

## 🛠️ Development Tools

[![TypeORM](https://img.shields.io/badge/TypeORM-CLI-orange?style=for-the-badge&logo=typeorm&logoColor=white)]()
[![Postman](https://img.shields.io/badge/Postman-API_Testing-orange?style=for-the-badge&logo=postman&logoColor=white)]()
[![pgAdmin](https://img.shields.io/badge/pgAdmin-DB_Management-blue?style=for-the-badge&logo=postgresql&logoColor=white)]()

| Tool            | Purpose                                               |
|-----------------|-------------------------------------------------------|
| ⚙️ **TypeORM CLI** | Database migrations, schema sync, and seeding        |
| 📬 **Postman**     | API testing and documentation                       |
| 🗄️ **pgAdmin**     | PostgreSQL database management and queries          |

---

## 🚀 Running the App

```bash
# Install dependencies
npm install

# Start PostgreSQL (ensure service is running or via pgAdmin)
# Run the app in development mode
npm run start:dev

