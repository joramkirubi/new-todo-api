require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// ==============================
// MIDDLEWARE
// ==============================

// Allows Express to read JSON request bodies
app.use(express.json());

// Allows requests from other origins/frontend applications
app.use(cors());


// ==============================
// IN-MEMORY DATABASE
// ==============================

let todos = [
  {
    id: 1,
    task: 'Finish Week 4 slides',
    completed: false,
  },
  {
    id: 2,
    task: 'Deploy API (today!)',
    completed: true,
  },
];


// ==============================
// ROOT ROUTE
// ==============================

// GET /
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Todo API is running',
  });
});


// ==============================
// GET ALL TODOS
// ==============================

// GET /todos
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});


// ==============================
// GET ONE TODO
// ==============================

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);

  // Check if the ID is a valid number
  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid todo ID',
    });
  }

  // find() returns the first matching todo
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({
      error: 'Todo not found',
    });
  }

  res.status(200).json(todo);
});


// ==============================
// CREATE A NEW TODO
// ==============================

// POST /todos
app.post('/todos', (req, res) => {
  const { task } = req.body;

  // Validate task
  if (!task || typeof task !== 'string' || !task.trim()) {
    return res.status(400).json({
      error: 'Task is required',
    });
  }

  /*
    Generate a new ID.

    We do NOT use:
    todos.length + 1

    because deleting a todo could cause duplicate IDs.
  */
  const newId =
    todos.length > 0
      ? Math.max(...todos.map((todo) => todo.id)) + 1
      : 1;

  const newTodo = {
    id: newId,
    task: task.trim(),
    completed: false,
  };

  // Add the new todo to the array
  todos.push(newTodo);

  res.status(201).json(newTodo);
});


// ==============================
// UPDATE A TODO
// ==============================

// PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid todo ID',
    });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({
      error: 'Todo not found',
    });
  }

  const { task, completed } = req.body;

  // Update task only if it was provided
  if (task !== undefined) {
    if (typeof task !== 'string' || !task.trim()) {
      return res.status(400).json({
        error: 'Task must be a non-empty string',
      });
    }

    todo.task = task.trim();
  }

  // Update completed only if it was provided
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Completed must be true or false',
      });
    }

    todo.completed = completed;
  }

  res.status(200).json(todo);
});


// ==============================
// DELETE A TODO
// ==============================

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid todo ID',
    });
  }

  const lenBefore = todos.length;

  /*
    Keep every todo whose ID does NOT match
    the ID we want to delete.
  */
  todos = todos.filter((t) => t.id !== id);

  // If the length did not change, nothing was deleted
  if (todos.length === lenBefore) {
    return res.status(404).json({
      error: 'Todo not found',
    });
  }

  // Successful deletion with no response body
  res.status(204).send();
});


// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Todo API running on port ${PORT}`);
});