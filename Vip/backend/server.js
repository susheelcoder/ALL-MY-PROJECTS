// =====================================
// Verification System Backend
// Main Server
// server.js
// =====================================


const express = require("express");

const cors = require("cors");

const bodyParser = require("body-parser");

const path = require("path");





// Create App

const app = express();





// Port

const PORT = 5000;






// Middleware


app.use(cors());


app.use(bodyParser.json());



app.use(bodyParser.urlencoded({
    extended:true
}));







// Frontend Folder Access


app.use(express.static(
    path.join(__dirname,"../")
));






// Routes


const documentRoutes = require("./routes/documents");


const verifyRoutes = require("./routes/verify");






app.use(
    "/api/documents",
    documentRoutes
);



app.use(
    "/api/verify",
    verifyRoutes
);








// Home API Test


app.get("/api", function(req,res){


    res.json({

        message:
        "Verification System API Running"

    });


});







// Server Start



app.listen(PORT,function(){



    console.log(
        `Server running on port ${PORT}`
    );



});
