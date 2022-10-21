const express = require('express')
const mongodb = require('mongodb')
const Joi = require('joi')
const cors = require('cors')

const app = express()

//Middle ware
app.use(express.json())//parse json
app.use(cors())//to avoid different domain req errors




//get all todos
app.get("/api/todos", async (req, res) => {
    const todos = await loadPostCollection()
    const allTodos = await todos.find({}).toArray()

    res.send(allTodos)
})


//get specific todo
app.get("/api/todos/:id", async (req, res) => {

    try {
        const todos = await loadPostCollection()
        const specificTodo = await todos.findOne({ _id: new mongodb.ObjectId(req.params.id) })
        res.status(200).send(specificTodo)
    } catch (error) {
        res.status(404).send("Error 404 Not Found")
    }

})


//Add a todo
app.post("/api/todos", async (req, res) => {
    const { error } = validateTask(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const todo = {
        text: req.body.text,
        date: new Date()
    }

    const todos = await loadPostCollection()
    await todos.insertOne(todo)

    return res.status(201).send(todo)

})


//Edit a todo
app.put("/api/todos/:id", async (req, res) => {

    const { error } = validateTask(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    try {
        const todos = await loadPostCollection()
        //update
        await todos.updateOne({ _id: new mongodb.ObjectId(req.params.id) },
            {
                $set: { "text": req.body.text }
            })

        //get
        const updatedTodo = await todos.findOne({ _id: new mongodb.ObjectId(req.params.id) })
        res.status(200).send(updatedTodo)

    } catch (error) {
        res.status(404).send("Error 404 Not Found")
    }



})


//Delete a todo
app.delete("/api/todos/:id", async (req, res) => {

    try {
        const todos = await loadPostCollection()
        await todos.deleteOne({ _id: new mongodb.ObjectId(req.params.id) })
        res.status(200).send("Task is deleted")
    } catch (error) {
        res.status(404).send("Error 404 Not Found")
    }

})



//Mongodb Client
async function loadPostCollection() {
    const client = await mongodb.MongoClient.connect
        ( "mongodb+srv://zay0od777:Test12345@cluster0.oevycdy.mongodb.net/test", {
            useNewUrlParser: true
        })

    return client.db('vue_todo_app').collection('posts')
}



//start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on ${PORT}`))




//Validate client request body
function validateTask(task) {

    const schema = Joi.object({
        text: Joi.string().required()
    })

    return schema.validate(task)
}