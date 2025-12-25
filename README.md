# Nationwide_Sales_Distribution_System
An app that would help sale representatives (SRs) sell products to retailers across a nation. Each SR will be assigned to a list of retailers from a nationwide pool of ~millions. This project focuses on data modelling, performance and scalability. Scalability in terms of software design, root-level performance, readability and maintainability


Commands in order:

1. docker compose up -d (rename .env.example to .env and set the values accordingly)

2. cd server

3. npm install

4. npx prisma generate

5. npx prisma migrate deploy

6. npm run seed (to populate the database)

7. npm run dev
