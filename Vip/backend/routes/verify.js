// =====================================
// Verification System Backend
// Verify Routes
// verify.js
// =====================================


const express = require("express");

const fs = require("fs");

const path = require("path");



const router = express.Router();





// Documents JSON File


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
// Verify Document
// API:
// GET /api/verify/:id
// =====================================


router.get("/:id", function(req,res){



    try{



        let documents = readDocuments();





        let document = documents.find(function(doc){



            return doc.id === req.params.id;



        });







        if(document){





            res.json({


                verified:true,


                message:
                "Document Verified Successfully",


                document:document



            });






        }

        else{





            res.status(404).json({



                verified:false,


                message:
                "Invalid Document ID",


                document:null



            });






        }






    }


    catch(error){



        res.status(500).json({



            verified:false,


            message:
            "Verification Server Error"



        });



    }




});








// =====================================
// Verify By Query
// API:
// GET /api/verify?id=XXXX
// =====================================


router.get("/", function(req,res){



    let id = req.query.id;





    if(!id){



        return res.status(400).json({


            message:
            "Document ID Required"


        });


    }







    let documents = readDocuments();






    let document = documents.find(function(doc){



        return doc.id === id;



    });








    if(document){



        res.json({


            verified:true,


            document:document



        });



    }


    else{


        res.json({


            verified:false,


            document:null



        });



    }





});







module.exports = router;
