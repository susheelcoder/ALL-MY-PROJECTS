// =====================================
// Verification System
// Joining Letter Generator JS
// joining.js
// =====================================



// Generate Joining Letter

function generateJoining(){



    // Get Form Data


    let name = document.getElementById("joiningName").value;


    let empID = document.getElementById("employeeID").value;


    let designation = document.getElementById("joiningDesignation").value;


    let department = document.getElementById("joiningDepartment").value;


    let joiningDate = document.getElementById("joiningDate2").value;


    let manager = document.getElementById("manager").value;


    let company = document.getElementById("joiningCompany").value;


    let address = document.getElementById("joiningAddress").value;





    if(name === "" || designation === ""){


        alert("Please fill Employee Name and Designation");


        return;


    }






    // Current Date


    let today = new Date();


    let date = today.toLocaleDateString();






    // Update Preview



    document.getElementById("joiningPreviewName").innerHTML = name;


    document.getElementById("joiningPreviewID").innerHTML = empID;


    document.getElementById("joiningPreviewDesignation").innerHTML = designation;


    document.getElementById("joiningPreviewDepartment").innerHTML = department;


    document.getElementById("joiningPreviewJoiningDate").innerHTML = joiningDate;


    document.getElementById("joiningPreviewManager").innerHTML = manager;


    document.getElementById("joiningPreviewCompany").innerHTML = company;


    document.getElementById("joiningPreviewDate").innerHTML = date;







    // Document Object



    let documentData = {



        id:createJoiningID(),


        name:name,


        employeeID:empID,


        company:company,


        type:"Joining Letter",


        designation:designation,


        department:department,


        joiningDate:joiningDate,


        manager:manager,


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






    alert("Joining Letter Generated Successfully");



}







// =====================================
// Create Joining Document ID
// =====================================


function createJoiningID(){



    let time = Date.now();


    let random = Math.floor(Math.random()*1000);




    return "JOIN-" + time + "-" + random;



}
