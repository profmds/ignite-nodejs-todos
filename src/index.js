const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const foundUser = users.find(user => user.username === username)

  if (!foundUser) {
    return response.status(400).json({ error: "User not found!" })
  }
  request.user = foundUser

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(
    user => user.username === username
  )

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const foundTodo = user.todos.find(todo => todo.id === id)

  if (!foundTodo) {
    return response.status(404).json({ error: "This todo not exists!" })
  }

  const updatedTodo = {
    id,
    title,
    done: foundTodo.done,
    deadline: new Date(deadline),
    created_at: foundTodo.created_at
  }

  console.log(updatedTodo)

  const updatedTodos = user.todos.map(todo => {
    if (todo.id === id) {
      return updatedTodo
    }
  })

  user.todos = updatedTodos

  return response.json(updatedTodo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const foundTodo = user.todos.find(todo => todo.id === id)

  foundTodo.done = true

  const updatedTodos = user.todos.map(todo => {
    if (todo.id === id) {
      return foundTodo
    }
  })

  user.todos = updatedTodos

  return response.json(foundTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const foundTodo = user.todos.find(todo => todo.id === id)

  if (!foundTodo) {
    return response.status(404).json({ error: "This todo not exists" })
  }

  const updatedTodos = user.todos.filter(todo => todo !== foundTodo)

  user.todos = updatedTodos

  return response.status(204).send()

});

module.exports = app;