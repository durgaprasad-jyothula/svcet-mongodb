// server.js
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let tasksCollection;

async function run() {
    try {
        await client.connect();
        const database = client.db('taskmanager');
        tasksCollection = database.collection('tasks');
        console.log('Connected to MongoDB.');
    } catch (error) {
        console.error(error);
    }
}

run().catch(console.error);

// Create (Insert)
app.post('/tasks', async (req, res) => {
    try {
        const task = req.body;
        const result = await tasksCollection.insertOne(task);
        res.status(201).send(result.ops[0]);
    } catch (error) {
        res.status(500).send({ error: 'Failed to create task' });
    }
});

// Read (Find all)
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await tasksCollection.find({}).toArray();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch tasks' });
    }
});

// Update
app.put('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;

    try {
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        if (result.matchedCount === 0) {
            res.status(404).send({ error: 'Task not found' });
        } else {
            res.status(200).send({ message: 'Task updated successfully' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Failed to update task' });
    }
});

// Delete
app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).send({ error: 'Task not found' });
        } else {
            res.status(200).send({ message: 'Task deleted successfully' });
        }
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete task' });
    }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    process.on('SIGINT', () => {
        client.close().then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});
