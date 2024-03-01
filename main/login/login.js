document.addEventListener('DOMContentLoaded', function(){
    const iconClose = document.querySelector('.icon-close');

    iconClose.addEventListener('click', ()=>{
        document.body.classList.add('fade-out');

        setTimeout(function(){
            window.location.href = '../main.html';
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