let allBooks = [];

// Function to fetch all books using Axios
function getAllBooks() {
    axios.get('/books')
        .then(function (response) {
            allBooks = response.data.books; // Assign the fetched books to the allBooks variable
            // Clear the search input
            searchInput.value = ''
            // Display all books initially
            displayBooks(allBooks);
        })
        .catch(function (error) {
            console.error('Error fetching books:', error);
        });
}

// Function to create table headers
function createTableHeaders() {
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Publication Year</th>
            <th>Book Type</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;
    booksTable.appendChild(tableHeader);
}

// Call createTableHeaders once when the page loads
document.addEventListener('DOMContentLoaded', createTableHeaders);

// Display the table body
function displayBooks(books) {
    const tableBody = document.createElement('tbody');

    // Remove existing rows from the table
    const existingTableBody = booksTable.getElementsByTagName('tbody')[0];
    if (existingTableBody) existingTableBody.remove();

    // Use forEach loop to display the books
    books.forEach(function (book) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book['publication year']}</td>
            <td>${book['book Type']}</td>
            <td>${book.status}</td>
            <td>
                <button onclick="loanBook(${book.bookID})">Loan</button>
                <button onclick="toggleEditBookForm(${book.bookID})">Edit</button>
                <button onclick="deleteBook(${book.bookID})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('booksTable').appendChild(tableBody);
}

// Handle form submission and add a new book
function addNewBook(event) {
    event.preventDefault();

    // Get the selected bookType value from the radio buttons
    const selectedBookType = document.querySelector('input[name="bookType"]:checked');

    // Send a POST request to Flask API to add the new book
    axios.post('/books', {
        "title": title.value,
        "author": author.value,
        "publishedYear": publishedYear.value,
        "bookType": parseInt(selectedBookType.value)
    })
        .then(function () {
            // Reload the book list to show the newly added book
            getAllBooks();
            // Clear the form fields
            newBookForm.reset();
            // Hide the form
            toggleAddBookForm();
            // Show a success notification
            showSuccessNotification('New book added successfully!');
        })
        .catch(function (error) {
            console.error('Error adding a new book:', error);
        });
}

// Function to toggle the add book form's visibility
function toggleAddBookForm() {
    if (addBookForm.style.display === 'none' || addBookForm.style.display === '') {
        addBookForm.style.display = 'block';
        toggleFormButton.textContent = 'Cancel';
    } else {
        addBookForm.style.display = 'none';
        toggleFormButton.textContent = 'Add New Book';
    }
}

// Attach event listeners to the form and button
document.addEventListener('DOMContentLoaded', function () {
    getAllBooks();
    newBookForm.addEventListener('submit', addNewBook);
    editForm.addEventListener('submit', editBook);
    toggleFormButton.addEventListener('click', toggleAddBookForm);
});

// Function to delete a book by bookID
function deleteBook(bookID) {
    // Ask for confirmation from the user
    const userConfirmed = confirm("Are you sure you want to delete this book?");
    if (userConfirmed) {
        // Send a DELETE request to Flask API to delete the book
        axios.delete(`/books/${bookID}`)
            .then(function () {
                // Reload the book list to reflect the deleted book
                getAllBooks();
                // Show a success notification
                showSuccessNotification('Book deleted successfully!');
            })
            .catch(function (error) {
                console.error(`Error deleting book with ID ${bookID}:`, error);
            });
    }
}

// Function to toggle the add book form's visibility
function toggleEditBookForm(bookID) {
    currentBookID = bookID;
    editBookForm.style.display = (editBookForm.style.display === 'none') ? 'block' : 'none'
}

// Update book details
function editBook() {

    // Get the book type selection value
    const selectedNewBookType = document.querySelector('input[name="newBookType"]:checked');

    // Creating an object to store the updated customer details
    const updatedBook = {};

    // check if each input is not empty or none, then add it to the "updatedBook" objedt
    if (newTitle.value) updatedBook.title = newTitle.value;
    if (newAuthor.value) updatedBook.author = newAuthor.value;
    if (newPublishedYear.value) updatedBook.publishedYear = newPublishedYear.value;
    if (selectedNewBookType) updatedBook.bookType = selectedNewBookType.value;

    // Sends the PUT request to the flask app
    axios.put(`/books/${currentBookID}`, updatedBook);
}

function loanBook(bookID) {
    // Check if the book is available
    const book = allBooks.find((book) => book.bookID === bookID);

    if (book && book.status === 'available') {
        const customerID = prompt("Please enter your customer ID:"); // Prompt the user for customer ID

        // Check if the user entered a customer ID
        if (customerID !== null && customerID.trim() !== "") {
            // Send a POST request to Flask API to create a new loan for the book
            axios.post('/loans', {
                "bookID": bookID,
                "customerID": customerID,
            })
                .then(function (response) {
                    // Check if the request was successful
                    if (response.data.message === 'Loan created successfully!') {
                        // Show a success notification
                        showSuccessNotification('Book loaned successfully');
                        getAllBooks()
                    }
                    else showErrorNotification('Customer not found')
                })
                .catch(function (error) {
                    console.error('Error loaning book:', error);
                });
        } else {
            return
        }
    } else {
        // Handle the case where the book is not available
        showErrorNotification('The selected book is not available for loan.');
    }
}

// Search a book by title / author using "filter"
function search() {
    const search_Input = searchInput.value.toLowerCase();
    const filteredBooks = allBooks.filter(function (book) {
        return book.title.toLowerCase().includes(search_Input) ||
            book.author.toLowerCase().includes(search_Input);
    });
    displayBooks(filteredBooks);
}

// Function to display a success notification using Toastify
function showSuccessNotification(message) {
    Toastify({
        text: message,
        duration: 3000, // Notification will disappear after 3 seconds
        gravity: 'top', // Position it at the top of the screen
        position: 'center', // Position it horizontally in the center
        backgroundColor: '#04AA6D', // Background color for success
    }).showToast();
}

// Function to display an error notification using Toastify
function showErrorNotification(message) {
    Toastify({
        text: message,
        duration: 3000, // Notification will disappear after 3 seconds
        gravity: 'top', // Position it at the top of the screen
        position: 'center', // Position it horizontally in the center
        backgroundColor: 'red', // Background color for errors
    }).showToast();
}