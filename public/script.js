// Don't remove this code
const container = document.querySelector(".container");
const signUp = document.querySelector(".signup-link");
const login = document.querySelector(".login-link");
 
 // js code to appear signup and login form
 signUp.addEventListener("click", ( )=>{
    container.classList.add("active");
});
login.addEventListener("click", ( )=>{
    container.classList.remove("active");
});
/* Instructions:

You are tasked with creating functionality for a signup form where user data is collected and saved into variables, and then implementing a validation check during login to verify if the provided credentials are valid or not. The provided code contains HTML and JavaScript files within a folder. You are instructed not to modify the existing code in the index.js file. Instead, you are required to download the given folder and add your JavaScript code below the existing code in the index.js file to accomplish the task.

Using the Document Object Model (DOM), create functions to:

Collect user data from the signup form and store it in variables.
Implement a validation check during login to verify if the provided credentials match the saved data.
Ensure that your added code is properly commented and organized for clarity and readability.

*/

// // Add your code here
// const signupButton=document.getElementById('signup-btn');
// const loginButton=document.getElementById('login-btn');

// let signupEmail,loginEmail,signupPassword,loginPassword;
// // Function to collect user data from the signup form and store it in variables
// function collectUserData() {
//     signupEmail=document.getElementById('signup-email').value;
//     signupPassword=document.getElementById('signup-password').value;
// }

// // Function to validate user credentials during login
// function validateCredentials() {
//     // Retrieve user input for login
//     loginEmail=document.getElementById('login-email').value;
//     loginPassword=document.getElementById('login-password').value;


//     // Check if the provided credentials match the valid ones
//     if (loginEmail === signupEmail && loginPassword === signupPassword) {
//         // If credentials are valid, return true
//         return true;
//     } else {
//         // If credentials are invalid, return false
//         return false;
//     }
// }

// // Event listener for the login button
// loginButton.addEventListener("click", () => {
//     // Call the validateCredentials function to check if credentials are valid
//     const isValid = validateCredentials();

//     // Display appropriate message based on validation result
//     if (isValid) {
//         alert("Login successful!");
//     } else {
//         alert("Invalid email or password. Please try again.");
//     }
// });

// // Event listener for the signup button
// signupButton.addEventListener("click", () => {
//     // Call the collectUserData function to collect user data from the signup form
//     const userData = collectUserData();
//     alert('SignUp Successfull!!')
//     container.classList.remove("active");

//     console.log(userData);
// });
