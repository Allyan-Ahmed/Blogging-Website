const express = require("express");
const userModel = require("./model/userModel");
const categoryModel = require("./model/category");
const bcrypt = require("bcrypt");
require("./database");
const postModel = require("./model/postModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const session = require("express-session");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "session@26", // Replace with a random string used to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  // Example: Set name based on logged-in user
  if (req.session.user) {
    res.locals.name = req.session.user.name;
  } else {
    res.locals.name = 'Guest';
  }
  next();
});
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Multer to use storage
const upload = multer({ storage: storage });

// View Client Home Page
app.get("/", async (req, res) => {
  try {
    const post = await postModel.find();
    const cat = await categoryModel.find();

    // Extract and combine all keywords
    let allKeywords = [];
    post.forEach((post) => {
      if (post.keywords) {
        allKeywords = allKeywords.concat(
          post.keywords.split(",").map((keyword) => keyword.trim())
        );
      }
    });

    // Create a map to store the count of posts for each category
    const categoryCounts = {};

    // Initialize categoryCounts with zero for each category
    cat.forEach((category) => {
      categoryCounts[category.name] = 0;
    });

    // Count posts for each category
    post.forEach((post) => {
      if (post.category && categoryCounts[post.category] !== undefined) {
        categoryCounts[post.category]++;
      }
    });

    // Add the count to each category object
    cat.forEach((category) => {
      category.count = categoryCounts[category.name] || 0;
    });

    // Filter out unique keywords
    const uniqueKeywords = [...new Set(allKeywords)];
    res.render("client/index.ejs", {
      posts: post,
      category: cat,
      keywords: uniqueKeywords,
    });
  } catch (err) {
    console.log(err);
  }
});

// Route to handle the search functionality
app.get("/search", async (req, res) => {
  const query = req.query.q;
  try {
    // Perform the search
    const posts = await postModel.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { keywords: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });

    const categories = await categoryModel.find({});

    // Extract and combine all keywords
    let allKeywords = [];
    posts.forEach((post) => {
      if (post.keywords) {
        allKeywords = allKeywords.concat(
          post.keywords.split(",").map((keyword) => keyword.trim())
        );
      }
    });

    // Filter out unique keywords
    const uniqueKeywords = [...new Set(allKeywords)];

    // Render the search results page
    res.render("client/searchResults.ejs", {
      posts,
      categories,
      keywords: uniqueKeywords,
      query,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// Login Form
app.get("/admin-login", (req, res) => {
  res.render("login/login.ejs");
});

//Forget Password
app.get("/forget", (req, res) => {
  res.render("login/forgetpassword.ejs");
});

// Register User
app.post("/add-user", async (req, res) => {
  const data = {
    fullname: req.body.username,
    password: req.body.password,
    email: req.body.email,
    contact: req.body.contact,
    role: req.body.role,
  };

  const existingUser = await userModel.findOne({ email: data.email });
  if (existingUser) {
    res.send("User already exists. Please choose a different username.");
  } else {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;

    const userdata = await userModel.insertMany(data);
    res.send("User Added");
  }
});

// Handle Post Login Request
app.post("/post-login", async (req, res) => {
  try {
    const check = await userModel.findOne({ email: req.body.email });
    if (!check) {
      res.send("User Not Found!");
      return;
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );
    if (!isPasswordMatch) {
      res.send("wrong Password");
    } else {
      // Save user details in session
      req.session.user = {
        id: check._id,
        name: check.fullname, // Assuming your user model has a 'fullname' field
      };
      res.redirect("/dashboard");
    }
  } catch (error) {
    res.send(error);
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Error logging out");
    }
    res.redirect("/admin-login"); // Redirect to login page after logout
  });
});

// Handle Add Category Request
app.post("/add-cat", async (req, res) => {
  const data = { name: req.body.cat_name };

  const existingCat = await categoryModel.findOne({ name: data.name });
  if (existingCat) {
    res.send("Cat already exists. Please choose a different name.");
  } else {
    const catdata = await categoryModel.insertMany(data);
    res.send("Category Added");
  }
});

// Handle Forget Password Post Request
app.post("/forgot-pass", (req, res) => {
  res.redirect("/admin-login");
});

// View About Page (Client)
app.get("/about", (req, res) => {
  res.render("client/about-us.ejs");
});

// View Contact Page (Client)
app.get("/contact", (req, res) => {
  res.render("client/contact.ejs");
});

// View Post Details (Client)
const mongoose = require("mongoose");

app.get("/postdetails/:id", async (req, res) => {
  const postId = req.params.id;

  // Check if postId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(404).send("Post not found");
  }

  try {
    const post = await postModel.findOne({ _id: postId });

    if (post) {
      return res.render("client/post-details.ejs", { post });
    } else {
      return res.status(404).send("Post not found");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

// View Dashboard (Admin)
app.get("/dashboard", (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  res.render("admin/dashboard.ejs");
});

// View Category (Admin)
app.get("/category", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  try {
    const cat = await categoryModel.find();
    res.render("admin/category.ejs", { cat });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Handle Add Post Post Request
app.post("/add-post", upload.single("image"), async (req, res, next) => {
  try {
    const obj = {
      title: req.body.title,
      description: req.body.desc,
      keywords: req.body.keywords,
      category: req.body.cat_name,
      img: {
        data: fs.readFileSync(
          path.join(__dirname + "/uploads/" + req.file.filename)
        ),
        contentType: req.file.mimetype,
      },
    };

    const post = await postModel.create(obj);
    res.send("Post Added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding post");
  }
});

// View Add Blog (Dashboard)
app.get("/addblog", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  try {
    const cat = await categoryModel.find();
    res.render("admin/addBlog.ejs", { cat });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// View Blog (Admin)
app.get("/viewblog", (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  postModel.find({}).then((data, err) => {
    if (err) {
      console.log(err);
    }
    res.render("admin/viewblog.ejs", { data });
  });
});

// View Add User (Admin)
app.get("/adduser", (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  res.render("admin/addUser.ejs");
});

// View User Profile (Admin)

app.get("/userprofile", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  // try {
  //   const users = await userModel.find(req.session.user._id);
    // console.log(users)
    // console.log(req.session.user._id)
    // const users = await userModel.find();
    // console.log(users)
    res.render("admin/userProfile.ejs");
  // } catch (error) {
  //   console.error("Error fetching data:", error);
  //   res.status(500).send("Internal Server Error");
  // }
});

// app.get("/userprofile", async (req, res) => {
//   // Check if user is logged in
//   if (!req.session.user) {
//     return res.redirect("/admin-login");
//   }

//   try {
//     const useremail = req.session.user.email; // Extract user ID for clarity

//     const user = await userModel.findOne(useremail);
//     if (!user) {
//       return res.status(404).send("User not found"); // Handle user not found
//     }

//     console.log(`Fetched user profile for user ID: ${useremail}`); // Log only user ID

//     res.render("admin/userProfile.ejs", { user }); // Pass only the user object
//   } catch (error) {
//     console.error("Error fetching user data:", error);

//     // Handle specific errors (e.g., CastError, MongooseError) if needed

//     res.status(500).send("Internal Server Error");
//   }
// });


// View User (Admin)
app.get("/viewuser", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  try {
    const user = await userModel.find();
    res.render("admin/viewUser.ejs", { user });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});
// DELETE request to delete a blogs by ID
app.delete("/blogs/:id", async (req, res) => {
  const blogId = req.params.id;

  try {
    const deletedBlog = await postModel.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).send({ error: "Blog not found" });
    }
    res.send(deletedBlog);
  } catch (error) {
    res.status(500).send({ error: "Error deleting category", details: error });
  }
});

// DELETE request to delete a user by ID
app.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await postModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send({ error: "User not found" });
    }
    res.send(deletedUser);
  } catch (error) {
    res.status(500).send({ error: "Error deleting category", details: error });
  }
});

// Delete Request to delete category by ID
app.delete("/categories/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    const deleteCategory = await categoryModel.findByIdAndDelete(categoryId);
    if (!deleteCategory) {
      return res.status(404).send({ error: "Category Not Found" });
    }
    res.send(deleteCategory);
  } catch (error) {
    res.status(500).send({
      error: "Error deleting category",
      details: error,
    });
  }
});

// Update Category
app.patch("/categories/:id", async (req, res) => {
  const categoryId = req.params.id;
  const updates = req.body;
  try {
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).send({ error: "Category not found" });
    }
    res.send(updatedCategory);
  } catch (error) {
    res.status(400).send({ error: "Error updating category", details: error });
  }
});

// Get post update page
// Edit blog form
app.get("/editBlog/:id", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  try {
    const blog = await postModel.findById(req.params.id);
    const cat = await categoryModel.find();
    res.render("admin/editBlog.ejs", { blog: blog, categories: cat });
  } catch (error) {
    res.status(404).send("Blog not found");
  }
});
/// Use app.patch for updating an existing resource
app.patch("/edit-post/:id", upload.single("image"), async (req, res) => {
  const postId = req.params.id;
  const { title, description, keywords, cat_name } = req.body;

  try {
    let updateFields = {
      title,
      description,
      keywords,
      category: cat_name,
    };

    // Check if a new image was uploaded
    if (req.file) {
      // Handle the new image upload
      // Example logic to save the uploaded image and update the blog post
      // Replace this logic with your actual file handling code

      // 1. Read the uploaded image file
      const imagePath = path.join(__dirname, "uploads", req.file.filename);
      const imageBuffer = fs.readFileSync(imagePath);

      // 2. Update the blog post with the new image data
      updateFields.image = {
        data: imageBuffer,
        contentType: req.file.mimetype,
      };

      // 3. Delete the temporary file from uploads folder (optional)
      fs.unlinkSync(imagePath);
    }
    // If no new image was uploaded, retain the existing image

    // Find and update the blog post by ID
    const updatedBlog = await postModel.findByIdAndUpdate(
      postId,
      updateFields,
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).send("Blog not found");
    }

    res.redirect("/"); // Redirect after successful update
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// Get user update page
// Edit user form
app.get("/editUser/:id", async (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/admin-login");
  }
  try {
    const user = await userModel.findById(req.params.id);
    res.render("admin/editUser.ejs", { user });
  } catch (error) {
    res.status(404).send("User not found");
  }
});
// Run the server (Listen Function)
app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

// Send Email from Contact Us Form
app.post("/sendemail", (req, res) => {
  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Replace with your SMTP server host
    port: 587, // Replace with your SMTP server port
    secure: false, // true for 465, false for other ports
    auth: {
      user: "", // Replace with your email
      pass: "", // Replace with your email password
    },
  });

  let senderEmail = req.body.email;
  // Set up email data with unicode symbols
  let mailOptions = {
    from: '"Reader Blog Customer" <${senderEmail}>', // sender address
    to: "", // list of receivers
    subject: req.body.subject, // Subject line
    text: req.body.message, // plain text body
    html: req.body.message, // html body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.send("Email Sent");
  });
});
