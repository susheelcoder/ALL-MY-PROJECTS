// =====================================
// Verification System
// Offer Letter Generator JS
// offer.js
// =====================================



// Generate Offer Letter

function generateOffer(){



    // Get Form Data

    let name = document.getElementById("employeeName").value;

    let father = document.getElementById("fatherName").value;

    let designation = document.getElementById("designation").value;

    let department = document.getElementById("department").value;

    let joiningDate = document.getElementById("joiningDate").value;

    let salary = document.getElementById("salary").value;

    let company = document.getElementById("companyName").value;

    let address = document.getElementById("companyAddress").value;




    if(name === "" || designation === ""){


        alert("Please fill Employee Name and Designation");

        return;

    }




    // Current Date

    let today = new Date();

    let date = today.toLocaleDateString();





    // Update Letter Preview



    document.getElementById("previewName").innerHTML = name;


    document.getElementById("previewDesignation").innerHTML = designation;


    document.getElementById("previewCompany").innerHTML = company;


    document.getElementById("previewCompany2").innerHTML = company;


    document.getElementById("previewJoining").innerHTML = joiningDate;


    document.getElementById("previewSalary").innerHTML = salary;


    document.getElementById("previewDepartment").innerHTML = department;


    document.getElementById("previewDate").innerHTML = date;





    // Create Document Object


    let documentData = {


        id:createDocumentID(),


        name:name,


        fatherName:father,


        company:company,


        type:"Offer Letter",


        designation:designation,


        department:department,


        joiningDate:joiningDate,


        salary:salary,


        address:address,


        status:"Generated",


        created:new Date().toISOString()



    };





    // Save Database


    saveDocument(documentData);





    // Generate QR


    if(typeof generateQR === "function"){


        generateQR(documentData.id);


    }





    alert("Offer Letter Generated Successfully");



}





// =====================================
// Create Unique Document ID
// =====================================


function createDocumentID(){


    let time = Date.now();


    let random = Math.floor(Math.random()*1000);



    return "DOC-" + time + "-" + random;



}
