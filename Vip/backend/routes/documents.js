// =====================================
// Verification System Backend
// Documents Routes
// documents.js
// =====================================


const express = require("express");

const fs = require("fs");

const path = require("path");



const router = express.Router();





// JSON Database File


const filePath = path.join(
    __dirname,
    "../../data/documents.json"
);







// =====================================
// Read Documents
// =====================================


function readDocuments(){


    let data = fs.readFileSync(
        filePath,
        "utf-8"
    );


    return JSON.parse(data);


}







// =====================================
// Save Documents
// =====================================


function saveDocuments(data){


    fs.writeFileSync(

        filePath,

        JSON.stringify(
            data,
            null,
            4
        )

    );


}









// =====================================
// GET All Documents
// API:
// /api/documents
// =====================================


router.get("/",function(req,res){



    try{


        let documents = readDocuments();



        res.json(documents);



    }


    catch(error){


        res.status(500).json({

            message:"Unable to read documents"

        });


    }



});









// =====================================
// GET Single Document
// API:
// /api/documents/:id
// =====================================


router.get("/:id",function(req,res){



    let documents = readDocuments();



    let document = documents.find(function(doc){



        return doc.id === req.params.id;



    });





    if(document){



        res.json(document);



    }


    else{


        res.status(404).json({

            message:"Document Not Found"

        });


    }



});









// =====================================
// CREATE DOCUMENT
// API:
// POST /api/documents
// =====================================


router.post("/",function(req,res){



    try{


        let documents = readDocuments();




        let newDocument = {


            id:req.body.id,


            name:req.body.name,


            employeeID:req.body.employeeID || "",


            company:req.body.company || "",


            type:req.body.type,


            designation:req.body.designation || "",


            department:req.body.department || "",


            joiningDate:req.body.joiningDate || "",


            salary:req.body.salary || "",


            status:"Generated",


            created:new Date().toISOString()



        };






        documents.push(newDocument);






        saveDocuments(documents);





        res.json({

            message:
            "Document Created Successfully",

            data:newDocument


        });



    }


    catch(error){


        res.status(500).json({

            message:"Create Failed"

        });


    }



});









// =====================================
// UPDATE DOCUMENT
// API:
// PUT /api/documents/:id
// =====================================


router.put("/:id",function(req,res){



    let documents = readDocuments();



    let index = documents.findIndex(function(doc){



        return doc.id === req.params.id;



    });





    if(index === -1){


        return res.status(404).json({

            message:"Document Not Found"

        });


    }





    documents[index] = {


        ...documents[index],


        ...req.body


    };






    saveDocuments(documents);






    res.json({

        message:
        "Document Updated",

        data:documents[index]


    });



});









// =====================================
// DELETE DOCUMENT
// API:
// DELETE /api/documents/:id
// =====================================


router.delete("/:id",function(req,res){



    let documents = readDocuments();




    let newDocuments = documents.filter(function(doc){



        return doc.id !== req.params.id;



    });





    saveDocuments(newDocuments);





    res.json({

        message:
        "Document Deleted"

    });



});







module.exports = router;
