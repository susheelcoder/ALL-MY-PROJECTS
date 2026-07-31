// =====================================
// Verification System
// Document Verify JS
// verify.js
// =====================================



// Page Load

document.addEventListener("DOMContentLoaded", function(){



    // Check QR URL ID


    let qrID = getQRDocumentID();



    if(qrID){


        document.getElementById("documentID").value = qrID;


        verifyDocumentNow();


    }



});







// =====================================
// Verify Document Function
// =====================================


function verifyDocumentNow(){



    let id = document
    .getElementById("documentID")
    .value
    .trim();





    if(id === ""){


        alert("Please Enter Document ID");


        return;


    }







    let result = verifyDocument(id);






    let box = document.getElementById("verifyResult");





    box.style.display="block";







    if(result.status === true){





        let doc = result.data;





        document.getElementById("resultID")
        .innerHTML = doc.id;





        document.getElementById("resultName")
        .innerHTML = doc.name;





        document.getElementById("resultCompany")
        .innerHTML = doc.company || "-";





        document.getElementById("resultType")
        .innerHTML = doc.type;





        document.getElementById("resultDesignation")
        .innerHTML = doc.designation || "-";





        document.getElementById("resultStatus")
        .innerHTML = 
        `<span class="status success">
        Verified
        </span>`;






    }



    else{





        document.getElementById("resultID")
        .innerHTML = id;





        document.getElementById("resultName")
        .innerHTML = "-";





        document.getElementById("resultCompany")
        .innerHTML = "-";





        document.getElementById("resultType")
        .innerHTML = "-";





        document.getElementById("resultDesignation")
        .innerHTML = "-";





        document.getElementById("resultStatus")
        .innerHTML = 
        `<span class="status failed">
        Invalid Document
        </span>`;





    }





}







// =====================================
// QR URL ID Reader
// =====================================


function getQRDocumentID(){



    let params = new URLSearchParams(

        window.location.search

    );



    return params.get("id");



}
