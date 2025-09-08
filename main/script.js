document.addEventListener('DOMContentLoaded', function(){
    const btnPopup = document.querySelector('.btnLogin-popup');

    btnPopup.addEventListener('click', function(){
        document.body.classList.add('fade-out');

        setTimeout(function(){
            window.location.href = 'login/login.html';
            console.log('moved to main');
        }, 500);
    });

    const pageLinks = document.getElementsByTagName('a');

    for (let i = 0; i < pageLinks.length; i++) {
        pageLinks[i].addEventListener('click', function(event) {
            const href = pageLinks[i].getAttribute('href');
            if(href && href !== "#"){
                event.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(function(){
                    window.location.href = href;
                }, 500);
            }
        });
    }

    if (hamburger && nav) {
        hamburger.addEventListener('click', function(){
            hamburger.classList.toggle("active");
            nav.classList.toggle("active");
        })
    }
});

function toggleMenu(element){
    element.classList.toggle("active");
    document.querySelector(".navigation").classList.toggle("active");
}

async function addUser(){
    try{
        const docRef = await db.collection("users").add({
            name: "Josh",
            age: 25
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e){
        console.error("Error adding document: ", e);
    }
}

