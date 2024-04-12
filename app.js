if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();

const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require("connect-mongo");
const session = require("express-session");
const nodemailer = require("nodemailer");
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", () => {
  console.log("ERROR in Mongo Session Store ", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

main()
  .then(() => {
    console.log("Connected To db");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}
app.listen(10000, () => {
  console.log("server is listening to port 8080");
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/ourteam", (req, res) => {
  res.render("team.ejs");
});

app.get("/connect", (req, res) => {
  res.render("connect.ejs");
});

app.get("/raf", (req, res) => {
  let currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1; // Months are zero-based (0 = January), so add 1
  var year = currentDate.getFullYear();
  res.render("forms/raf.ejs", { day: day, month: month, year: year });
});

app.get("/lfof", (req, res) => {
  let currentDate = new Date();
  var day = currentDate.getDate();
  var month = currentDate.getMonth() + 1; // Months are zero-based (0 = January), so add 1
  var year = currentDate.getFullYear();
  res.render("forms/lfof.ejs", { day: day, month: month, year: year });
});

app.get("/sendemail", (req, res) => {
  let message = `<strong>Respected Gunjanlal Sharma,<br>
  Livestock Field Officer Patiyala</strong>
  <br><br>
We hope this email finds you well. We are reaching out to inform you about a potential high-risk situation regarding a rabies-infected dog that has been reported in your area.
<br/><br/>
We have received credible information indicating the presence of a rabies-infected dog in your jurisdiction. Given the serious public health implications associated with rabies, we urge you to investigate this matter promptly and thoroughly.
<br/><br/>
Your role as the Livestock Field Officer is crucial in assessing the situation, gathering pertinent data, and taking appropriate action to mitigate the risk posed by the rabies-infected dog. We kindly request that you:
<br/><br/>
<ol>
<li>Conduct a thorough investigation into the reported presence of the rabies-infected dog in your area.
</li>
<li>
Collect relevant data and information pertaining to the dog's whereabouts, behavior, and potential interactions with humans and other animals.
</li>
<li>
Assess the extent of the risk posed by the rabies-infected dog to the community and livestock population.
</li>
<li>
Implement necessary measures to control the spread of rabies and protect the health and safety of residents and animals in the area.
</li>
<li>
Provide a detailed report of your findings, including any preventive actions taken and recommendations for further action.
</li>
</ol>
<br/><br/>
Time is of the essence in addressing this urgent matter. Your swift and decisive action can help prevent the potential spread of rabies and safeguard the well-being of the community.
 <br/><br/>
Please keep us informed of your progress and findings throughout the investigation process. If you require any assistance or support, please do not hesitate to reach out to us.
 <br/><br/>
 Thank you for your attention to this matter and your commitment to protecting public health and animal welfare.
 <br/><br/>
 <p style="color: red;font-weight:bolder;">
 Best regards,
 <br/><br/>
Mr. Somesh Sinha,
<br>
 Chief Coordinator,
 <br>
 SafeBite Surveillance, Pune.</p>
 <br/><br/>
<div>
<img
      src="https://res.cloudinary.com/ddxv0iwcs/image/upload/v1712925184/Picsart_24-04-12_00-03-37-024_jwrryw.png"
      style="border-radius:2rem;width:30%;"
      alt="..."
    />
</div>`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "smile.itsadil@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });
  const mailOptions = {
    from: "ChiefCoordinator@SafeBiteSurveillance<smile.itsadil@gmail.com>",
    to: "someshsinha902@gmail.com",
    subject: "Urgent: High Risk Alert - Rabies Dog Presence in Your Area",
    html: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Failed to send Alert");
    } else {
      req.flash("success", "Alert Sent Successfully !");
      res.redirect(`/`);
    }
  });
});
