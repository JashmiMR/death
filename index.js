const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware for parsing JSON and URL encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images, etc.) from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Database connection (replace 'your_database_url' with actual MongoDB connection string)
mongoose.connect("mongodb://localhost:27017/death_certificateDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Error connecting to the database:", err));

// Sample Schema for storing Death Certificate data
const deathCertificateSchema = new mongoose.Schema({
  date_of_death: Date,
  gender: String,
  deceased_name: String,
  care_of: String,
  father_husband_name: String,
  deceased_age_years: Number,
  deceased_age_months: Number,
  deceased_age_days: Number,
  deceased_age_hours: Number,
  permanent_address: {
    address_line: String,
    country: String,
    state: String,
    district: String,
    pin: String,
    mobile_no: String,
    email: String
  },
  place_of_death: {
    place: String,
    address_line: String,
    country: String,
    state: String,
    district: String,
    pin: String
  },
  files: {
    aadhaar_card: String,
    birth_certificate: String,
    medical_certificate: String
  },
  informant: {
    name: String,
    sex: String,
    same_as_permanent_address: Boolean,
    relation_with_deceased: String,
    identity_proof: String
  }
});

// Model for Death Certificate data
const DeathCertificate = mongoose.model("DeathCertificate", deathCertificateSchema);

// Route to serve the HTML form
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle form submission (POST request)
app.post("/submit-death-certificate", (req, res) => {
  let body = '';
  const files = {};

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    const boundary = req.headers["content-type"].split("boundary=")[1];
    const parts = body.split(`--${boundary}`);
    parts.forEach((part) => {
      if (part.includes("Content-Disposition")) {
        const [headers, content] = part.split("\r\n\r\n");
        if (headers.includes("filename=")) {
          // Extract file data
          const filenameMatch = headers.match(/filename="(.+?)"/);
          const filename = filenameMatch ? filenameMatch[1] : "unknown_file";
          files[filename] = content.trim(); // Simulate file saving
        } else {
          // Extract regular field
          const nameMatch = headers.match(/name="(.+?)"/);
          const name = nameMatch ? nameMatch[1] : null;
          if (name) {
            req.body[name] = content.trim();
          }
        }
      }
    });

    console.log("Parsed fields:", req.body);
    console.log("Parsed files:", files);

    // Correctly map all fields for the database
    const newCertificate = new DeathCertificate({
      date_of_death: req.body.date_of_death,
      gender: req.body.gender,
      deceased_name: req.body.deceased_name,
      care_of: req.body.care_of,
      father_husband_name: req.body.father_husband_name,
      deceased_age_years: req.body.deceased_age_years,
      deceased_age_months: req.body.deceased_age_months,
      deceased_age_days: req.body.deceased_age_days,
      deceased_age_hours: req.body.deceased_age_hours,
      permanent_address: {
        address_line: req.body.address_line,
        country: req.body.country,
        state: req.body.state,
        district: req.body.district,
        pin: req.body.pin,
        mobile_no: req.body.mobile_no,
        email: req.body.email,
      },
      place_of_death: {
        place: req.body.place_of_death,
        address_line: req.body.death_address_line,
        country: req.body.death_country,
        state: req.body.death_state,
        district: req.body.death_district,
        pin: req.body.death_pin,
      },
      files: {
        aadhaar_card: files["aadhaar_card"] || req.body.aadhaar_card,
        birth_certificate: files["birth_certificate"] || req.body.birth_certificate_proof,
        medical_certificate: files["medical_certificate"] || req.body.medicalcertificate_proof,
      },
      informant: {
        name: req.body.informant_name,
        sex: req.body.informant_sex,
        same_as_permanent_address: req.body.same_as_permanent_address === "true",
        relation_with_deceased: req.body.relation_with_deceased,
        identity_proof: req.body.identity_proof,
      },
    });

    // Save to database
    newCertificate
      .save()
      .then(() => {
        res.send("Death Certificate data saved successfully!");
      })
      .catch((err) => {
        console.error("Error saving data:", err);
        res.status(500).send("Error saving the death certificate data.");
      });
  });

  req.on("error", (err) => {
    console.error("Error reading request:", err);
    res.status(500).send("Error processing the form.");
  });
});



// Sample route (GET) for testing server connection
app.get("/", (req, res) => {
  res.set("Content-Type", "text/plain"); // Set the correct header for response type
  res.send("Server connection is successful"); // Send a response to the client
});

// Start the server
app.listen(4001, () => {
  console.log("Server running on port 4001");
});
