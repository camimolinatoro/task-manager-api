# Task Manager API

A simple REST API for task management, built with Express.js and SQLite, with a full Postman/Newman test suite.

## Endpoints

| Method | Endpoint          | Description          |
|--------|-------------------|-----------------------|
| GET    | /api/tasks        | Get all tasks         |
| GET    | /api/tasks/:id    | Get a task by id      |
| POST   | /api/tasks        | Create a new task     |
| PUT    | /api/tasks/:id    | Update a task         |
| DELETE | /api/tasks/:id    | Delete a task         |

## Tech stack

- Node.js + Express
- SQLite (file-based database)
- Postman + Newman (automated API testing, 16 assertions across 7 requests)

## How to run it

npm install
npm run dev


The server runs on http://localhost:3000

## How to run the test suite

With the server running, in a separate terminal:

npm install --save-dev newman
npx newman run "Task Manager API.postman_collection.json" --env-var "base_url=http://localhost:3000"


## Test coverage

- Create task (success + missing title validation)
- Get all tasks
- Get task by id (success + not found)
- Update task
- Delete task

16/16 assertions passing across 7 requests, covering both the happy path and error handling.

## Author

Camila Molina Toro, Systems Engineering student (UPB), focused on QA and software development.

LinkedIn: https://www.linkedin.com/in/camilamolinatoro

GitHub: https://github.com/camimolinatoro
