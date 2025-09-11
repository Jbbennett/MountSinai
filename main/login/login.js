import {auth, db}  from "/main/firebase/firebaseconfig.js";
import {signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function(){

    const googleBtn = document.getElementById("googleLogin");
    const errorMessage = document.getElementById("loginMessage");
    const usernamePrompt = document.getElementById("usernamePrompt");
    const usernameInput = document.getElementById("usernameInput");
    const usernameSubmit = document.getElementById("usernameSubmit");

    googleBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        googleBtn.disabled = true;
        const gProvider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, gProvider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if(!userSnap.exists()){
                usernamePrompt.style.display = "block";
                usernameSubmit.addEventListener("click", async () => {
                    const username = usernameInput.value.trim();
                    if(!username){
                        errorMessage.textContent = "Username cannot be empty!";
                        errorMessage.classList.remove("success");
                        errorMessage.classList.add("error");
                        errorMessage.style.visibility = "visible";
                        errorMessage.style.opacity = 1;
                        return;
                    }

                    await setDoc(userRef, {
                        username: username,
                        email: user.email,
                        profileURL: user.photoURL || null,
                        createdAt: new Date()
                    });
                    
                    usernamePrompt.classList.add("hidden");

                    setTimeout(() => {
                        usernamePrompt.style.display = "none";
                    }, 300);

                    errorMessage.textContent = "Login successful!";
                    errorMessage.classList.remove("error");
                    errorMessage.classList.add("success");
                    errorMessage.style.color = "green";
                    errorMessage.style.visibility = "visible";
                    errorMessage.style.opacity = 1;

                    setTimeout(() => {
                        window.location.href = "/main/main.html"
                    },1000);

                }, {once: true});
            }

            errorMessage.textContent = "Login successful!";
            errorMessage.classList.remove("error");
            errorMessage.classList.add("success");
            errorMessage.style.color = "green";
            errorMessage.style.visibility = "visible";
            errorMessage.style.opacity = 1;

            const formWrapper = document.querySelector(".form-box.login");
            setTimeout(() => {
                formWrapper.classList.add("fade-out");
                errorMessage.style.opacity = 0;
                setTimeout(() => {
                    errorMessage.style.visibility = "hidden";
                    window.location.href = "/main/main.html";
                }, 250);
            }, 1500);
        } catch (err) {
            console.error("login error:", err);
            errorMessage.textContent = "Error: " + err.message;
            errorMessage.classList.remove("success");
            errorMessage.classList.add("error");
            errorMessage.style.visibility = "visible";
            errorMessage.style.opacity = 1;
        } finally {
            googleBtn.disabled = false
        }
    })

    document.body.classList.add('fade-in');

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try{
            await signInWithEmailAndPassword(auth, email, password);

            errorMessage.textContent ="Login successful!";
            errorMessage.classList.remove("error");
            errorMessage.classList.add("success");
            errorMessage.style.visibility = "visible";

            setTimeout (() => {errorMessage.style.opacity = 1;}, 10);

            setTimeout (() => {
                const formWrapper = document.querySelector('.form-box.login');
                formWrapper.classList.add('fade-out');
                errorMessage.style.opacity = 0;
                setTimeout(() => {
                    errorMessage.style.visibility = "hidden";
                    window.location.href = "/main/main.html";
                }, 250)
            },1500);

        } catch (err) {
            errorMessage.textContent = "Error: " + err.message;
            errorMessage.classList.remove("success");
            errorMessage.classList.add("error");
            errorMessage.style.visibility = "visible";
            errorMessage.style.opacity = 1;
        }
    })

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