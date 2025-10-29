import React from 'react';

const Todo = ({ todo, toggleTodo }) => {
  return (
    <li
      className={todo.completed ? 'completed' : ''}
      onClick={() => toggleTodo(todo.id)}
    >
      <span className="checkbox">{todo.completed ? '✓' : ''}</span>
      <span className="todo-text">{todo.text}</span>
    </li>
  );
};

export default Todo;
