//in router file, you have defined that how you want to store one document in database's collection, which is mentioned in index.js of root 

const { Todo } = require('../models/todo');

const express = require('express');

//joi for data validation entered by client
const Joi = require('joi');

//creating router application by using express.Router method.

const router = express.Router()

router.get('/', async (req, res) =>
{
  //get all the todos available in todo database and sort them according to latest date, and show only selected options.

  try
  {
    const todo = await Todo.find({ isComplete: true }).sort({ date: -1 })
      .select({ name: 1, author: 1, date: 1, isComplete: true });
    res.send(todo);
  } catch (error)
  {
    res.status(500).send(error.message);
    console.log(error.message);
  }
})

//post method to post todo to the mongodb, but before it, validating name, author, uid, isComplete, date of todo by using Joi
router.post('/', async (req, res) =>
{
  const schema = Joi.object({
    name: Joi.string().min(3).max(200).required(),
    author: Joi.string().min(3).max(20).required(),
    uid: Joi.string(),
    isComplete: Joi.boolean(),
    date: Joi.date()
  })

  //destruct error from req.body
  const { error } = schema.validate(req.body)

  //if there is an error in validation in req.body, then show 400 status, and send the error throught it's object's first array item object's first property message.
  if (error) return res.status(400).send(error.details[0].message)

  //if there is no any error, then send all these values entered by client/user to todoSchema, and then save them in mongoDB

  //destruct name, author, isComplete, date, uid from req.body
  const { name, author, isComplete, date, uid } = req.body;

  //save name, author, isComplete,date, uid values in todo variable by using Todo class new object method.
  let todo = new Todo({
    name, author, isComplete, date, uid,
  });

  try
  {
    //save this todo in mongodb and send it back to the user throught response.
    todo = await todo.save();
    res.send(todo);
  }
  catch (error)
  {
    res.status(500).send(error.message);
    console.log(error.message);
  }
})

//delete request
//we can delete document by using three types.
//deleteOne
//deleteMany
//findByIdAndDelete

router.delete('/', async (req, res) => 
{
  const todo = await Todo.deleteOne({
    isComplete: true
  })

  res.send(todo);
}
)

module.exports = router;