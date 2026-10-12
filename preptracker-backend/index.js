// ===== IMPORTS =====
const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');

const app = express();
app.use(cors());
app.use(express.json());

// ===== NEO4J CONNECTION =====
const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "Katyayini@2709")
);

const PORT = 5000;

// ===== REGISTER =====
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `CREATE (u:User {
                id: randomUUID(),
                name: $name,
                email: $email,
                password: $password
            }) RETURN u`,
            { name, email, password }
        );
        res.json(result.records[0].get('u').properties);
    } catch (err) {
        console.log("REGISTER ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== LOGIN =====
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `MATCH (u:User {email: $email, password: $password})
             RETURN u`,
            { email, password }
        );

        if (result.records.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json(result.records[0].get('u').properties);
    } catch (err) {
        console.log("LOGIN ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== GET USER BY ID (NEW API) =====
app.get('/api/users/:id', async (req, res) => {
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `MATCH (u:User {id: $id}) RETURN u`,
            { id: req.params.id }
        );

        if (result.records.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.records[0].get('u').properties);
    } catch (err) {
        console.log("GET USER ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== ADD QUESTION =====
app.post('/api/questions', async (req, res) => {
    const { userId, question, company, subject, difficulty } = req.body;
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `
            MATCH (u:User {id: $userId})
            CREATE (q:Question {
                id: randomUUID(),
                question: $question,
                company: $company,
                subject: $subject,
                difficulty: $difficulty,
                completed: false,
                createdAt: datetime()
            })
            CREATE (u)-[:HAS]->(q)
            RETURN q
            `,
            { userId, question, company, subject, difficulty }
        );
        res.json(result.records[0].get('q').properties);
    } catch (err) {
        console.log("ADD QUESTION ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== GET QUESTIONS =====
app.get('/api/questions/:userId', async (req, res) => {
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `
            MATCH (u:User {id: $userId})-[:HAS]->(q:Question)
            RETURN q ORDER BY q.createdAt DESC
            `,
            { userId: req.params.userId }
        );

        const questions = result.records.map(r => r.get('q').properties);
        res.json(questions);
    } catch (err) {
        console.log("GET QUESTIONS ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== TOGGLE QUESTION =====
app.put('/api/questions/:id/toggle', async (req, res) => {
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `
            MATCH (q:Question {id: $id})
            SET q.completed = NOT q.completed
            RETURN q
            `,
            { id: req.params.id }
        );

        res.json(result.records[0].get('q').properties);
    } catch (err) {
        console.log("TOGGLE ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== DELETE QUESTION =====
app.delete('/api/questions/:id', async (req, res) => {
    const session = driver.session({ database: "neo4j" });

    try {
        await session.run(
            `MATCH (q:Question {id: $id}) DETACH DELETE q`,
            { id: req.params.id }
        );
        res.json({ message: "Deleted" });
    } catch (err) {
        console.log("DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== ADD MATERIAL =====
app.post('/api/materials', async (req, res) => {
    const { userId, title, link } = req.body;
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `
            MATCH (u:User {id: $userId})
            CREATE (m:Material {
                id: randomUUID(),
                title: $title,
                link: $link
            })
            CREATE (u)-[:HAS_MATERIAL]->(m)
            RETURN m
            `,
            { userId, title, link }
        );

        res.json(result.records[0].get('m').properties);
    } catch (err) {
        console.log("MATERIAL ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== GET MATERIALS =====
app.get('/api/materials/:userId', async (req, res) => {
    const session = driver.session({ database: "neo4j" });

    try {
        const result = await session.run(
            `
            MATCH (u:User {id: $userId})-[:HAS_MATERIAL]->(m:Material)
            RETURN m
            `,
            { userId: req.params.userId }
        );

        const materials = result.records.map(r => r.get('m').properties);
        res.json(materials);
    } catch (err) {
        console.log("GET MATERIALS ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== DELETE MATERIAL =====
app.delete('/api/materials/:id', async (req, res) => {
    const session = driver.session({ database: "neo4j" });

    try {
        await session.run(
            `MATCH (m:Material {id: $id}) DETACH DELETE m`,
            { id: req.params.id }
        );
        res.json({ message: "Deleted" });
    } catch (err) {
        console.log("DELETE MATERIAL ERROR:", err);
        res.status(500).json({ error: err.message });
    } finally {
        await session.close();
    }
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});