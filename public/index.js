// Delete Category 
function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this category?")) {
      fetch(`/categories/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert("Category deleted successfully");
            location.reload();
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }

  //Delete Blog
  function deleteBlog(id) {
    if (confirm("Are you sure you want to delete this blog?")) {
      fetch(`/blogs/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert("Blog deleted successfully");
            location.reload();
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }

  // Delete User
  function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
      fetch(`/users/${id}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert("User deleted successfully");
            location.reload();
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  }
  function showUpdateForm(id, name) {
    document.getElementById("updateCategoryId").value = id;
    document.getElementById("updateCategoryName").value = name;
    $("#updateCategoryModal").modal("show");
  }
  function updateCategory() {
    const id = document.getElementById("updateCategoryId").value;
    const name = document.getElementById("updateCategoryName").value;
    console.log("Updating category:", id, name); 
    fetch(`/categories/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert("Category updated successfully");
          location.reload();
        }
      })
      .catch((error) => console.error("Error:", error));
  }

 
