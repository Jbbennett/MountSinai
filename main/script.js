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
            event.preventDefault();
            
            document.body.classList.add('fade-out');
            
            setTimeout(function() {
                window.location.href = pageLinks[i].getAttribute('href');
            }, 500); 
        });
    }
});