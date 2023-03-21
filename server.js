const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const cors = require('cors');
const multer = require('multer');

PORT=8080;

// connect to db
let db;
(async () => {
	db = await open({
		filename: 'database.db',
		driver: sqlite3.Database
	});
})();

app = express();
const upload = multer({storage: multer.memoryStorage()});
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

// simple data route to verify that data is being gathered, this will be modified accordingly after implementing
// the login system.
app.get("/data", async (req, res) => {
	const guests = await db.all("SELECT * FROM guest");
	const organizers = await db.all("SELECT * FROM organizer");
	res.json({guests: guests, organizers: organizers});
});

app.get("/", function (req, res) {
    res.send("test");
});

app.get("/guest", (req, res) => {
	res.sendFile(__dirname + "/guestTemplate.html")
});
app.get("/eventName/:eventId", async (req, res) => {
	const eventId = req.params.eventId;
	const eventName = await db.get("SELECT event_name FROM organizer WHERE id = ?", eventId);
	res.json(eventName);
})
app.post("/guest", upload.single('file'), async(req, res) => {
	await db.run("INSERT INTO guest (name, message, file) VALUES (?, ?, ?)", [req.body.name, req.body.message, req.file.buffer]);
	res.sendFile(__dirname + "/guestTemplate.html");
});
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));