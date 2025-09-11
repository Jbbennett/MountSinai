// Import Firebase auth and Firestore from your config
import { auth, db } from "/main/firebase/firebaseconfig.js";

// Import required Firebase functions
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
    const formWrapper = document.querySelector('.form-box.register');
    const messageDiv = document.getElementById("registerMessage");
  // Close icon fades out to main
  const iconClose = document.querySelector('.icon-close');
  iconClose.addEventListener('click', () => {
    document.body.classList.add('fade-out');
    setTimeout(() => window.location.href = '../main.html', 500);
  });

  // Login button fades out to login page
  const btnPopup = document.querySelector('.btnLogin-popup');
  btnPopup.addEventListener('click', () => {
    document.body.classList.add('fade-out');
    setTimeout(() => window.location.href = '../login/login.html', 500);
  });

  // Nav links fade-out animation
  const pageLinks = document.getElementsByTagName('a');
  for (let i = 0; i < pageLinks.length; i++) {
    pageLinks[i].addEventListener('click', function (event) {
      event.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => window.location.href = pageLinks[i].getAttribute('href'), 500);
    });
  }

  // Registration form logic
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const termsChecked = document.getElementById("terms").checked;

    if (!termsChecked) {
      alert("You must agree to the terms & conditions.");
      return;
    }

    try {
      // Create user in Firebase Auth (auto-signs in)
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Save extra user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        username,
        lowCaseUser: username.toLowerCase(),
        email: user.email,
        createdAt: new Date()
      });

      messageDiv.textContent = "Registered successfully!";
      messageDiv.classList.remove("error");
      messageDiv.classList.add("success");
      messageDiv.style.visibility = "visible";

      setTimeout(() => {
        messageDiv.style.opacity = 1;
      }, 10);
      
      setTimeout(() => {
        formWrapper.classList.add("fade-out");
        messageDiv.style.opacity = 0 ;
        setTimeout(() => {
            messageDiv.style.visibility = "hidden";

            window.location.href = "/main/main.html";
        }, 250);
      }, 1500);


    } catch (err) {
      messageDiv.textContent = "Error: " + err.message;
      messageDiv.classList.remove("success");
      messageDiv.classlist.add("error");
      messageDiv.style.display = "block";
      messageDiv.style.opacity = 1;
    }
  });


});