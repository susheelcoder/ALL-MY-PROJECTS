
// =================================
// Verification System Dashboard JS
// app.js
// =================================


// Page Load
document.addEventListener("DOMContentLoaded", function(){


    loadDashboardData();

});



// =================================
// Load Dashboard Data
// =================================

function loadDashboardData(){


    let documents = getDocuments();


    let offer = 0;
    let joining = 0;
    let experience = 0;
    let verified = 0;



    documents.forEach(function(doc){


        if(doc.type === "Offer Letter"){

            offer++;

        }


        else if(doc.type === "Joining Letter"){

            joining++;

        }


        else if(doc.type === "Experience Letter"){

            experience++;

        }


        if(doc.status === "Verified"){

            verified++;

        }


    });



    // Update Dashboard Count

    document.getElementById("offerCount").innerHTML = offer;

    document.getElementById("joiningCount").innerHTML = joining;

    document.getElementById("experienceCount").innerHTML = experience;

    document.getElementById("verifyCount").innerHTML = verified;



    loadRecentDocuments(documents);


}




// =================================
// Recent Documents Table
// =================================

function loadRecentDocuments(documents){


    let table = document.getElementById("recentTable");


    if(!table){

        return;

    }



    table.innerHTML = "";



    let latest = documents.slice(-5).reverse();



    if(latest.length === 0){


        table.innerHTML = `

        <tr>

            <td colspan="4">

            No Documents Found

            </td>

        </tr>

        `;


        return;

    }




    latest.forEach(function(doc){



        let row = `


        <tr>

            <td>
            ${doc.id}
            </td>


            <td>
            ${doc.name}
            </td>


            <td>
            ${doc.type}
            </td>


            <td>
            <span>

            ${doc.status}

            </span>
            </td>


        </tr>


        `;



        table.innerHTML += row;



    });



}





// =================================
// Navigation Helper
// =================================


function openPage(page){


    window.location.href = page;


}





// =================================
// System Notification
// =================================


function showMessage(message){


    alert(message);


}
