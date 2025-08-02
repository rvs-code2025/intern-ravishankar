Schedula - Healthcare Appointment Backend
Most of the backend routes are completed and everything is functioning as expected. A few routes related to Slots and Appointments, especially for elastic scheduling, are still pending. I’ll be integrating those updates tomorrow morning.
Thank you for your continued patience and support. I’m committed to ensuring everything is finalized and stable by tonight.

Tech Stack

- NestJS
- PostgreSQL
- TypeORM
- JWT
- class-validator
- @nestjs/config
---
Environment Variables
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Vsnl@123
DB_NAME=hospital_management_system
# JWT Secret Key
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=7d
---
Api Endpoints:-

AuthController {/api/auth}

{/api/auth/login, POST}
{/api/auth/register/doctor, POST}
{/api/auth/register/patient, POST}
{/api/auth/patient/logout, POST}
{/api/auth/doctor/logout, POST}
{/api/auth/patient, GET} +65ms
{/api/auth/patient/profile, GET}
{/api/auth/doctor/profile, GET}

---------------------------------------------------------------------
Doctors
{/api/patients/:id, PATCH}
{/api/patients, GET}
--------------------------------------------------------------

Slots
{/api/slots, POST}
{/api/slots, GET}
{/api/slots/doctor/:id, GET}
{/api/slots/:id/unavailable, PATCH}

Appointments
{/api/appointments/book, POST}
{/api/appointments/patient/:id, GET}
{/api/appointments, GET}
{/api/appointments/cancel/:id, PATCH}  
{/api/appointments/reschedule/:id, PATCH}

---
Dev Tools

- TypeORM CLI
- Postman
- pgAdmin

Running the App
```base
# Install dependencies
npm install
# Start PostgreSQL if needed

# pgAdmin/Services on Windows

# Run the app

npm run start:dev
---
