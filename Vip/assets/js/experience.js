// =====================================
// Verification System
// Experience Letter Generator JS
// experience.js
// =====================================



// Generate Experience Letter

function generateExperience(){



    // Get Form Data


    let name = document.getElementById("experienceName").value;


    let empID = document.getElementById("experienceID").value;


    let designation = document.getElementById("experienceDesignation").value;


    let department = document.getElementById("experienceDepartment").value;


    let joiningDate = document.getElementById("experienceJoiningDate").value;


    let lastDate = document.getElementById("lastWorkingDate").value;


    let company = document.getElementById("experienceCompany").value;


    let address = document.getElementById("experienceAddress").value;


    let work = document.getElementById("workDescription").value;







    if(name === "" || designation === ""){


        alert("Please fill Employee Name and Designation");


        return;


    }








    // Current Date


    let today = new Date();


    let date = today.toLocaleDateString();








    // Update Preview





    document.getElementById("experiencePreviewName")
    .innerHTML = name;





    document.getElementById("experiencePreviewCompany")
    .innerHTML = company;





    document.getElementById("experiencePreviewCompany2")
    .innerHTML = company;





    document.getElementById("experiencePreviewDesignation")
    .innerHTML = designation;





    document.getElementById("experiencePreviewDepartment")
    .innerHTML = department;





    document.getElementById("experiencePreviewJoining")
    .innerHTML = joiningDate;





    document.getElementById("experiencePreviewLastDate")
    .innerHTML = lastDate;





    document.getElementById("experiencePreviewWork")
    .innerHTML = work;





    document.getElementById("experiencePreviewDate")
    .innerHTML = date;









    // Create Document Object




    let documentData = {




        id:createExperienceID(),



        name:name,



        employeeID:empID,



        company:company,



        type:"Experience Letter",



        designation:designation,



        department:department,



        joiningDate:joiningDate,



        lastWorkingDate:lastDate,



        workDescription:work,



        address:address,



        status:"Generated",



        created:new Date().toISOString()



    };







    // Save Document


    saveDocument(documentData);








    // Generate QR


    if(typeof generateQR === "function"){



        generateQR(documentData.id);



    }






    alert("Experience Letter Generated Successfully");



}







// =====================================
// Create Experience ID
// =====================================


function createExperienceID(){



    let time = Date.now();



    let random = Math.floor(Math.random()*1000);





    return "EXP-" + time + "-" + random;



}
