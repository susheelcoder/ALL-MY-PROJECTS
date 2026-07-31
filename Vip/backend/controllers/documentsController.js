// =====================================
// Verification System Backend
// Documents Controller
// documentsController.js
// =====================================


const fs = require("fs");

const path = require("path");



const filePath = path.join(
    __dirname,
    "../../data/documents.json"
);





function readDocuments(){


    let data = fs.readFileSync(
        filePath,
        "utf-8"
    );


    return JSON.parse(data);


}





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








// Get All Documents

exports.getDocuments = (req,res)=>{


    let documents = readDocuments();


    res.json(documents);


};








// Get Single Document

exports.getDocumentByID = (req,res)=>{


    let documents = readDocuments();



    let document = documents.find(

        doc=>doc.id === req.params.id

    );



    if(document){


        res.json(document);


    }

    else{


        res.status(404).json({

            message:"Document Not Found"

        });


    }


};









// Create Document


exports.createDocument = (req,res)=>{



    let documents = readDocuments();




    let newDocument = {


        id:req.body.id,


        name:req.body.name,


        employeeID:req.body.employeeID || "",


        company:req.body.company || "",


        type:req.body.type,


        designation:req.body.designation || "",


        department:req.body.department || "",


        status:"Generated",


        created:new Date().toISOString()



    };




    documents.push(newDocument);




    saveDocuments(documents);




    res.json({

        message:
        "Document Created",

        data:newDocument

    });


};









// Update Document


exports.updateDocument = (req,res)=>{


    let documents = readDocuments();



    let index = documents.findIndex(

        doc=>doc.id === req.params.id

    );



    if(index === -1){


        return res.status(404).json({

            message:"Not Found"

        });


    }




    documents[index] = {

        ...documents[index],

        ...req.body

    };




    saveDocuments(documents);



    res.json({

        message:"Updated",

        data:documents[index]

    });



};








// Delete Document


exports.deleteDocument = (req,res)=>{


    let documents = readDocuments();



    let filter = documents.filter(

        doc=>doc.id !== req.params.id

    );




    saveDocuments(filter);



    res.json({

        message:"Deleted"

    });



};
