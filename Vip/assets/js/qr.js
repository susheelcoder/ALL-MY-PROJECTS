// =====================================
// Verification System
// QR Code Generator JS
// qr.js
// =====================================



// QR Container ID

const QR_CONTAINER = "offerQR";




// =====================================
// Generate QR Code
// =====================================


function generateQR(documentID){



    let container = document.getElementById(QR_CONTAINER);



    if(!container){

        return;

    }



    // Clear Previous QR


    container.innerHTML = "";





    // Verification URL


    let verifyURL = window.location.origin + 
    "/verify.html?id=" + documentID;






    // Create QR



    new QRCode(container, {


        text: verifyURL,


        width:100,


        height:100,


        colorDark:"#000000",


        colorLight:"#ffffff",


        correctLevel:QRCode.CorrectLevel.H



    });



}







// =====================================
// Read QR ID From URL
// =====================================


function getQRDocumentID(){



    let params = new URLSearchParams(

        window.location.search

    );



    return params.get("id");



}
