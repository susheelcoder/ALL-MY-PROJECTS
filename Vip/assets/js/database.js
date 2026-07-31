// =====================================
// Verification System
// Database Management JS
// database.js
// =====================================



// Database Key

const DATABASE_KEY = "verification_documents";




// =====================================
// Get All Documents
// =====================================


function getDocuments(){


    let data = localStorage.getItem(DATABASE_KEY);



    if(data){


        return JSON.parse(data);


    }


    return [];


}






// =====================================
// Save New Document
// =====================================


function saveDocument(documentData){



    let documents = getDocuments();



    documents.push(documentData);



    localStorage.setItem(

        DATABASE_KEY,

        JSON.stringify(documents)

    );



    return true;


}







// =====================================
// Find Document By ID
// =====================================


function getDocumentByID(id){



    let documents = getDocuments();



    let document = documents.find(function(doc){


        return doc.id === id;


    });



    return document || null;



}






// =====================================
// Update Document
// =====================================


function updateDocument(id, updateData){



    let documents = getDocuments();



    let index = documents.findIndex(function(doc){


        return doc.id === id;


    });




    if(index !== -1){



        documents[index] = {


            ...documents[index],


            ...updateData



        };




        localStorage.setItem(

            DATABASE_KEY,

            JSON.stringify(documents)

        );



        return true;


    }



    return false;



}







// =====================================
// Delete Document
// =====================================


function deleteDocument(id){



    let documents = getDocuments();



    let newDocuments = documents.filter(function(doc){



        return doc.id !== id;



    });





    localStorage.setItem(

        DATABASE_KEY,

        JSON.stringify(newDocuments)

    );



    return true;



}







// =====================================
// Verify Document
// =====================================


function verifyDocument(id){



    let document = getDocumentByID(id);




    if(document){



        return {


            status:true,


            data:document



        };



    }



    return {


        status:false,


        data:null



    };



}







// =====================================
// Clear Database
// =====================================


function clearDatabase(){



    localStorage.removeItem(DATABASE_KEY);



}




// =====================================
// Demo Data (First Testing)
// =====================================


function createDemoData(){



    let documents = getDocuments();



    if(documents.length === 0){



        saveDocument({


            id:"DOC-DEMO-001",


            name:"Demo Employee",


            type:"Offer Letter",


            company:"Demo Company",


            designation:"Developer",


            status:"Verified",


            created:new Date().toISOString()



        });



    }



}
