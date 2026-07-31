// =====================================
// Verification System
// PDF Generator JS
// pdf.js
// =====================================



// =====================================
// Download Letter PDF
// =====================================


function downloadPDF(){



    let letter = document.querySelector(".letter-preview");



    if(!letter){


        alert("Letter Preview Not Found");


        return;


    }





    let employeeName = "Document";



    let nameElement = document.getElementById("previewName");



    if(nameElement){


        employeeName = nameElement.innerText;


    }






    let options = {



        margin:0,


        filename:
        employeeName + "_Letter.pdf",



        image:{


            type:"jpeg",


            quality:0.98


        },



        html2canvas:{


            scale:2,


            useCORS:true



        },



        jsPDF:{


            unit:"mm",


            format:"a4",


            orientation:"portrait"



        }



    };







    html2pdf()

    .set(options)

    .from(letter)

    .save();



}
